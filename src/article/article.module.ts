import { forwardRef, Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
  imports: [forwardRef(() => CommentModule)],
  exports: [ArticleService],
})
export class ArticleModule {}
