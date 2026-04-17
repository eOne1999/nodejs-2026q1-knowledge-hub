import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  findAllByArticleId(@Query('articleId') articleId: string) {
    return this.commentService.findAllByArticleId(articleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Post()
  @Roles(Role.editor, Role.admin)
  create(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }

  @Delete(':id')
  @Roles(Role.editor, Role.admin)
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string; role: Role } },
  ) {
    this.commentService.remove(id, req.user);
  }
}
