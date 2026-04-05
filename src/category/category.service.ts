import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from './category.interface';
import { validate as uuidValidate } from 'uuid';
import { randomUUID } from 'crypto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private categories: Category[] = [];

  findAll(): Category[] {
    return this.categories;
  }

  findOne(id: string): Category {
    let result: Category | undefined;

    if (uuidValidate(id)) {
      result = this.categories.find((category) => category.id === id);
    } else {
      throw new BadRequestException('Category id is invalid');
    }

    if (result) {
      return result;
    } else {
      throw new NotFoundException('Category not found');
    }
  }

  create(dto: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: randomUUID(),
      ...dto,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  update(id: string, dto: UpdateCategoryDto): Category {
    let categoryId: number;

    if (uuidValidate(id)) {
      categoryId = this.categories.findIndex((category) => category.id === id);
    } else {
      throw new BadRequestException('Category id is invalid');
    }

    if (categoryId !== -1) {
      const category = this.categories[categoryId];
      const updatedCategory: Category = {
        ...category,
        ...dto,
      };
      this.categories[categoryId] = updatedCategory;
      return updatedCategory;
    } else {
      throw new NotFoundException('Category not found');
    }
  }

  remove(id: string) {
    let categoryId: number;

    if (uuidValidate(id)) {
      categoryId = this.categories.findIndex((category) => category.id === id);
    } else {
      throw new BadRequestException('Category id is invalid');
    }

    if (categoryId !== -1) {
      this.categories.splice(categoryId, 1);
    } else {
      throw new NotFoundException('Category not found');
    }
  }
}
