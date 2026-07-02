import { PartialType } from '@nestjs/mapped-types';
import { CreateSanidadAnimalDto } from './create-sanidad_animal.dto';

export class UpdateSanidadAnimalDto extends PartialType(CreateSanidadAnimalDto) {}
