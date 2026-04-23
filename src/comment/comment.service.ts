import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Article, Comment, Role } from '@prisma/client';

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

  async remove(
    id: string,
    currentUser: { userId: string; role: Role },
  ): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Comment id is invalid');
    }
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (
      currentUser.role === 'editor' &&
      comment.authorId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });
  }
}
