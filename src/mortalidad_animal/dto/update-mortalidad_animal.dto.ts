import { PartialType } from '@nestjs/mapped-types';
import { CreateMortalidadAnimalDto } from './create-mortalidad_animal.dto';

export class UpdateMortalidadAnimalDto extends PartialType(CreateMortalidadAnimalDto) {}
