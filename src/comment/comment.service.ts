import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { Comment } from './comment.interface';
import { randomUUID } from 'crypto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class CommentService {
  constructor(
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService,
  ) {}

  private comments: Comment[] = [];

  findAll(): Comment[] {
    return this.comments;
  }

  findAllByArticleId(articleId: string): Comment[] {
    if (uuidValidate(articleId)) {
      return this.comments.filter((comment) => comment.articleId === articleId);
    } else {
      throw new BadRequestException('Article id is invalid');
    }
  }

  findOne(id: string): Comment {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Comment id is invalid');
    }
    const result = this.comments.find((c) => c.id === id);
    if (!result) {
      throw new NotFoundException('Comment not found');
    }
    return result;
  }

  create(dto: CreateCommentDto): Comment {
    const articles = this.articleService.findAll();
    const article = articles.find((article) => article.id === dto.articleId);

    if (article) {
      const newComment: Comment = {
        ...dto,
        id: randomUUID(),
        createdAt: Date.now(),
      };
      this.comments.push(newComment);
      return newComment;
    } else {
      throw new UnprocessableEntityException("Article doesn't exist");
    }
  }

  remove(id: string) {
    let commentId: number;

    if (uuidValidate(id)) {
      commentId = this.comments.findIndex((Comment) => Comment.id === id);
    } else {
      throw new BadRequestException('Comment id is invalid');
    }

    if (commentId !== -1) {
      this.comments.splice(commentId, 1);
    } else {
      throw new NotFoundException('Comment not found');
    }
  }
}
