import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalFincaDto } from './create-animal_finca.dto';
import { CreateAvicolaDto } from './create-avicola.dto';

export class UpdateAnimalFincaDto extends PartialType(CreateAnimalFincaDto) {}

export class UpdateAvicolaFincaDto extends PartialType(CreateAvicolaDto) {}
