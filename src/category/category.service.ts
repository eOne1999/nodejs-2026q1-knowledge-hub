import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { sortDataByOrder } from 'src/utils/sortDataByOrder';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page?: number,
    limit?: number,
    sortBy?: string,
    order?: string,
  ) {
    let data: Category[] = await this.prisma.category.findMany();

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

  async findOne(id: string): Promise<Category> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Category id is invalid');
    }
    const category: Category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Category id is invalid');
    }
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Category id is invalid');
    }
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');

    await this.prisma.category.delete({ where: { id } });
  }
}
