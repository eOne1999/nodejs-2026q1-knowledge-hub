import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { sortDataByOrder } from 'src/utils/sortDataByOrder';
import { Article, Prisma, Role, Tag } from '@prisma/client';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  private mapArticle(article: Article & { tags?: Tag[] }) {
    return {
      ...article,
      tags: article.tags?.map((t: Tag) => t.name) ?? [],
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  async findAll(
    page?: number,
    limit?: number,
    status?: string,
    categoryId?: string,
    tag?: string,
    sortBy?: string,
    order?: string,
  ) {
    const where: Prisma.ArticleWhereInput = {};
    if (status) where.status = status as any;
    if (categoryId) where.categoryId = categoryId;
    if (tag) where.tags = { some: { name: tag } };

    const articles: Article[] = await this.prisma.article.findMany({
      where,
      include: { tags: true },
    });

    let data: Article[] = articles.map(this.mapArticle.bind(this));

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

  async findOne(id: string): Promise<Article> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Article id is invalid');
    }
    const article: Article = await this.prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!article) throw new NotFoundException('Article not found');
    return this.mapArticle(article);
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    const article: Article = await this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: (dto.status as any) || 'draft',
        authorId: dto.authorId ?? null,
        categoryId: dto.categoryId ?? null,
        tags: dto.tags?.length
          ? {
              connectOrCreate: dto.tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });
    return this.mapArticle(article);
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
    currentUser: { userId: string; role: Role },
  ): Promise<Article> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Article id is invalid');
    }
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');

    if (
      currentUser.role === 'editor' &&
      article.authorId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only update your own articles');
    }

    const updatedArticle: Article = await this.prisma.article.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.status !== undefined && { status: dto.status as any }),
        ...(dto.authorId !== undefined && { authorId: dto.authorId }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.tags !== undefined && {
          tags: {
            set: [],
            connectOrCreate: dto.tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: { tags: true },
    });
    return this.mapArticle(updatedArticle);
  }

  async remove(id: string): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Article id is invalid');
    }
    const exists = await this.prisma.article.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Article not found');

    await this.prisma.article.delete({ where: { id } });
  }
}
