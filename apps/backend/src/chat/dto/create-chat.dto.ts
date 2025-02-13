import { IsNotEmpty, IsString, IsOptional, IsMongoId, IsArray, ArrayUnique } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty({ message: 'Message field is required' })
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsMongoId()
  creatorId: string;

  @IsOptional()
  @IsMongoId()
  replyId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  mentionIds?: string[];

  @IsNotEmpty()
  @IsMongoId()
  roomId: string;
}
