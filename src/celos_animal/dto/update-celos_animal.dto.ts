import { PartialType } from '@nestjs/mapped-types';
import { CreateCelosAnimalDto } from './create-celos_animal.dto';

export class UpdateCelosAnimalDto extends PartialType(CreateCelosAnimalDto) {}
