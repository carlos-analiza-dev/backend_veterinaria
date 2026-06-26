import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalFincaDto } from './create-animal_finca.dto';
import { CreateAvicolaDto } from './create-avicola.dto';
import { CreatePecesDto } from './create-peces.dto';

export class UpdateAnimalFincaDto extends PartialType(CreateAnimalFincaDto) {}

export class UpdateAvicolaFincaDto extends PartialType(CreateAvicolaDto) {}

export class UpdatePecesFincaDto extends PartialType(CreatePecesDto) {}
