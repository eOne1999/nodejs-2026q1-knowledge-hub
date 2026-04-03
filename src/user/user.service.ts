import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdatePasswordDto,
  User,
  UserRole,
} from './user.interface';
import { validate as uuidValidate } from 'uuid';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
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

  findAll() {
    return this.users.map((user) => this.sanitize(user));
  }

  findOne(id: string) {
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

  create(dto: CreateUserDto) {
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

  update(id: string, dto: UpdatePasswordDto) {
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

  remove(id: string) {
    let userId: number;

    if (uuidValidate(id)) {
      userId = this.users.findIndex((user) => user.id === id);
    } else {
      throw new BadRequestException('User id is invalid');
    }

    if (userId !== -1) {
      this.users.splice(userId, 1);
    } else {
      throw new NotFoundException('User not found');
    }
  }
}
