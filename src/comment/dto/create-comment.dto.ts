import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  articleId: string;

  @IsOptional()
  @IsUUID()
  authorId: string | null;
}
