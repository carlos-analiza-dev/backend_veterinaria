import { IsOptional, IsString, IsUUID } from 'class-validator';

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
}
