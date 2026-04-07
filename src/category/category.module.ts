import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ArticleModule } from 'src/article/article.module';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [ArticleModule],
})
export class CategoryModule {}
