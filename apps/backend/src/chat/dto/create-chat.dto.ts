// src/chat/dto/create-chat.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsMongoId()
  creatorId: string;

  @IsOptional()
  @IsMongoId()
  replyId?: string;

  @IsOptional()
  @IsMongoId()
  mentionId?: string;

  @IsNotEmpty()
  @IsMongoId()
  roomId: string;
}
