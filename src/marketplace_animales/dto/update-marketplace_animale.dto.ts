import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketplaceAnimaleDto } from './create-marketplace_animale.dto';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateMarketplaceAnimaleDto extends PartialType(
  CreateMarketplaceAnimaleDto,
) {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  imagenesEliminar?: string[];
}
