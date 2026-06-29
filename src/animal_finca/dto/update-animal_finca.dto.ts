import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalFincaDto } from './create-animal_finca.dto';
import { CreateAvicolaDto } from './create-avicola.dto';
import { CreatePecesDto } from './create-peces.dto';
import { CreateCaprinoDto } from './crear-caprino.dto';
import { CreateOvinoDto } from './create-ovino.dto';

export class UpdateAnimalFincaDto extends PartialType(CreateAnimalFincaDto) {}

export class UpdateAvicolaFincaDto extends PartialType(CreateAvicolaDto) {}

export class UpdatePecesFincaDto extends PartialType(CreatePecesDto) {}

export class UpdateCaprinoFincaDto extends PartialType(CreateCaprinoDto) {}

export class UpdateOvinoFincaDto extends PartialType(CreateOvinoDto) {}
