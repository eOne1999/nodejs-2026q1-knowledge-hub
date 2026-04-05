import { forwardRef, Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ArticleModule } from 'src/article/article.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [forwardRef(() => ArticleModule)],
  exports: [CommentService],
})
export class CommentModule {}
