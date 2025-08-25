import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoriaDto } from './create-subcategoria.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubcategoriaDto extends PartialType(CreateSubcategoriaDto) {
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  is_active?: boolean;
}
