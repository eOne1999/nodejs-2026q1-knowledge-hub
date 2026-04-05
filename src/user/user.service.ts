import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from './user.interface';
import { validate as uuidValidate } from 'uuid';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ArticleService } from 'src/article/article.service';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class UserService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly commentService: CommentService,
  ) {}

  private users: User[] = [];

  private sanitize(user: User) {
    return {
      id: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findAll(): Omit<User, 'password'>[] {
    return this.users.map((user) => this.sanitize(user));
  }

  findOne(id: string): User {
    let result: User | undefined;

    if (uuidValidate(id)) {
      result = this.users.find((user) => user.id === id);
    } else {
      throw new BadRequestException('User id is invalid');
    }

    if (result) {
      return result;
    } else {
      throw new NotFoundException('User not found');
    }
  }

  create(dto: CreateUserDto): Omit<User, 'password'> {
    const newUser: User = {
      id: randomUUID(),
      login: dto.login,
      password: dto.password,
      role: dto.role || UserRole.VIEWER,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.users.push(newUser);
    return this.sanitize(newUser);
  }

  update(id: string, dto: UpdatePasswordDto): Omit<User, 'password'> {
    let userId: number;

    if (uuidValidate(id)) {
      userId = this.users.findIndex((user) => user.id === id);
    } else {
      throw new BadRequestException('User id is invalid');
    }

    if (userId !== -1) {
      const user = this.users[userId];
      if (dto.oldPassword === user.password) {
        const updatedUser: User = {
          ...user,
          password: dto.newPassword,
          updatedAt: Date.now(),
        };
        this.users[userId] = updatedUser;
        return this.sanitize(updatedUser);
      } else {
        throw new ForbiddenException('Wrong password');
      }
    } else {
      throw new NotFoundException('User not found');
    }
  }

  remove(id: string): void {
    let userId: number;

    if (uuidValidate(id)) {
      userId = this.users.findIndex((user) => user.id === id);
    } else {
      throw new BadRequestException('User id is invalid');
    }

    if (userId !== -1) {
      const user = this.users[userId];
      this.users.splice(userId, 1);

      const userArticles = this.articleService
        .findAll()
        .filter((article) => article.authorId === user.id);
      userArticles.forEach((article) => {
        this.articleService.update(article.id, {
          ...article,
          authorId: null,
        });
      });

      const userComments = this.commentService
        .findAll()
        .filter((comment) => comment.authorId === user.id);
      userComments.forEach((comment) => this.commentService.remove(comment.id));
    } else {
      throw new NotFoundException('User not found');
    }
  }
}
