import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Article, Comment } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Comment[]> {
    const comments: Comment[] = await this.prisma.comment.findMany();
    return comments;
  }

  async findAllByArticleId(articleId: string): Promise<Comment[]> {
    if (!uuidValidate(articleId)) {
      throw new BadRequestException('Article id is invalid');
    }
    const comments: Comment[] = await this.prisma.comment.findMany({
      where: { articleId },
    });
    return comments;
  }

  async findOne(id: string): Promise<Comment> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Comment id is invalid');
    }
    const comment: Comment = await this.prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async create(dto: CreateCommentDto): Promise<Comment> {
    const article: Article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
    });
    if (!article) {
      throw new UnprocessableEntityException("Article doesn't exist");
    }

    const comment: Comment = await this.prisma.comment.create({ data: dto });
    return comment;
  }

  async remove(id: string): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Comment id is invalid');
    }
    const exists = await this.prisma.comment.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Comment not found');

    await this.prisma.comment.delete({ where: { id } });
  }
}
