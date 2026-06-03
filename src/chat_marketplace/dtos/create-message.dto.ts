import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MessageImageDto {
  @IsString()
  url: string;

  @IsString()
  key: string;

  @IsString()
  mimeType: string;
}

export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsUUID()
  productId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageImageDto)
  images?: MessageImageDto[];
}
