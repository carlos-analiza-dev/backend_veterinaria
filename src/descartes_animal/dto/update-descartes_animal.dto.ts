import { PartialType } from '@nestjs/mapped-types';
import { CreateDescartesAnimalDto } from './create-descartes_animal.dto';

export class UpdateDescartesAnimalDto extends PartialType(CreateDescartesAnimalDto) {}
