import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { sortDataByOrder } from 'src/utils/sortDataByOrder';
import { Role, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitize(user: User): Omit<User, 'password'> {
    return {
      id: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(
    page?: number,
    limit?: number,
    sortBy?: string,
    order?: string,
  ) {
    const users: User[] = await this.prisma.user.findMany();
    let data: User[] = users.map(this.sanitize.bind(this));

    if (sortBy) data = sortDataByOrder(data, sortBy, order);

    if (page && limit) {
      const total = data.length;
      return {
        total,
        page,
        limit,
        data: data.slice((page - 1) * limit, page * limit),
      };
    }
    return data;
  }

  async findOne(id: string): Promise<User> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('User id is invalid');
    }
    const user: User = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const user: User = await this.prisma.user.create({
      data: {
        login: dto.login,
        password: dto.password,
        role: dto.role || 'viewer',
      },
    });
    return this.sanitize(user);
  }

  async update(
    id: string,
    dto: UpdatePasswordDto,
    currentUser: { userId: string; role: Role },
  ): Promise<Omit<User, 'password'>> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('User id is invalid');
    }

    if (currentUser.userId !== id) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user: User = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.oldPassword !== user.password) {
      throw new ForbiddenException('Wrong password');
    }

    const updated: User = await this.prisma.user.update({
      where: { id },
      data: { password: dto.newPassword },
    });
    return this.sanitize(updated);
  }

  async remove(id: string): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('User id is invalid');
    }
    const user: User = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.article.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      });
      await tx.user.delete({ where: { id } });
    });
  }
}
