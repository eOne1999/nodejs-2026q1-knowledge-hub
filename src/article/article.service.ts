import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { randomUUID } from 'crypto';
import { Article, ArticleStatus } from './article.interface';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CommentService } from 'src/comment/comment.service';
import { sortDataByOrder } from 'src/utils/sortDataByOrder';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
  ) {}

  private articles: Article[] = [];

  findAll(
    page?: number,
    limit?: number,
    status?: string,
    categoryId?: string,
    tag?: string,
    sortBy?: string,
    order?: string,
  ) {
    let data: Article[] = this.articles.filter(
      (article) =>
        (!status || article.status === status) &&
        (!categoryId || article.categoryId === categoryId) &&
        (!tag || article.tags.includes(tag)),
    );

    if (sortBy) data = sortDataByOrder(data, sortBy, order);

    if (page && limit) {
      const total = data.length;
      return {
        total,
        page,
        limit,
        data: data.slice((page - 1) * limit, page * limit),
      };
    } else return data;
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
      const article = this.articles[articleId];
      this.articles.splice(articleId, 1);

      const articleComments = this.commentService
        .findAll()
        .filter((comment) => comment.articleId === article.id);
      articleComments.forEach((comment) =>
        this.commentService.remove(comment.id),
      );
    } else {
      throw new NotFoundException('Article not found');
    }
  }
}
