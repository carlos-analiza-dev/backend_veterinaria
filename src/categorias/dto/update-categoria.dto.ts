import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  is_active?: boolean;
}
