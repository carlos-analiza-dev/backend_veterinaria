import { PartialType } from '@nestjs/mapped-types';
import { CreateSanidadAnimalDto } from './create-sanidad_animal.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateSanidadAnimalDto extends PartialType(
  CreateSanidadAnimalDto,
) {
  @IsUUID('4', { message: 'El ID del animal debe ser un UUID válido' })
  @IsOptional()
  animalId?: string;
}
