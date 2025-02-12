import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayUnique,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { IsObjectId } from '../validators/object-id.validator'; // Assuming you have a custom ObjectId validator.

export class CreateBroadcastDto {
  @IsOptional()
  @IsObjectId()
  id: Types.ObjectId;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ValidateIf((obj) => obj.startTime < obj.endTime, {
    message: 'End time must be greater than start time',
  })
  endTime: Date;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsObjectId({ each: true }) // Validate each member as ObjectId
  members?: Types.ObjectId[];

  @IsNotEmpty()
  @IsEnum(['private', 'public'], { message: 'Visibility must be either "private" or "public"' })
  visibility: 'private' | 'public';

  @IsNotEmpty()
  @IsObjectId()
  creatorId: Types.ObjectId;
}

export class UpdateBroadcastDto {
  @IsOptional()
  @IsObjectId()
  id?: Types.ObjectId;

  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ValidateIf((obj) => obj.startTime && obj.endTime && obj.startTime < obj.endTime, {
    message: 'End time must be greater than start time',
  })
  endTime?: Date;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsObjectId({ each: true }) // Validate each member as ObjectId
  members?: Types.ObjectId[];

  @IsOptional()
  @IsEnum(['private', 'public'], { message: 'Visibility must be either "private" or "public"' })
  visibility?: 'private' | 'public';

  @IsOptional()
  @IsObjectId()
  creatorId?: Types.ObjectId;
}
