import { PartialType } from '@nestjs/mapped-types';
import { CreateUsoEquipoDto } from './create-uso_equipo.dto';

export class UpdateUsoEquipoDto extends PartialType(CreateUsoEquipoDto) {}
