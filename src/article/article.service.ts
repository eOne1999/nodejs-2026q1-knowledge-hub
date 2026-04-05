import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { randomUUID } from 'crypto';
import { Article, ArticleStatus } from './article.interface';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  private articles: Article[] = [];

  findAll(status?: string, categoryId?: string, tag?: string): Article[] {
    return this.articles.filter(
      (article) =>
        (!status || article.status === status) &&
        (!categoryId || article.categoryId === categoryId) &&
        (!tag || article.tags.includes(tag)),
    );
  }

  findOne(id: string): Article {
    let result: Article | undefined;

    if (uuidValidate(id)) {
      result = this.articles.find((article) => article.id === id);
    } else {
      throw new BadRequestException('Article id is invalid');
    }

    if (result) {
      return result;
    } else {
      throw new NotFoundException('Article not found');
    }
  }

  create(dto: CreateArticleDto): Article {
    const newArticle: Article = {
      ...dto,
      status: dto.status || ArticleStatus.DRAFT,
      authorId: dto.authorId || null,
      categoryId: dto.categoryId || null,
      tags: dto.tags || [],
      id: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.articles.push(newArticle);
    return newArticle;
  }

  update(id: string, dto: UpdateArticleDto): Article {
    let articleId: number;

    if (uuidValidate(id)) {
      articleId = this.articles.findIndex((article) => article.id === id);
    } else {
      throw new BadRequestException('Article id is invalid');
    }

    if (articleId !== -1) {
      const article = this.articles[articleId];
      const updatedArticle: Article = {
        ...article,
        ...dto,
        updatedAt: Date.now(),
      };
      this.articles[articleId] = updatedArticle;
      return updatedArticle;
    } else {
      throw new NotFoundException('Article not found');
    }
  }

  remove(id: string) {
    let articleId: number;

    if (uuidValidate(id)) {
      articleId = this.articles.findIndex((article) => article.id === id);
    } else {
      throw new BadRequestException('Article id is invalid');
    }

    if (articleId !== -1) {
      this.articles.splice(articleId, 1);
    } else {
      throw new NotFoundException('Article not found');
    }
  }
}
