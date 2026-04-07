import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ArticleModule } from 'src/article/article.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [ArticleModule, CommentModule],
})
export class UserModule {}
