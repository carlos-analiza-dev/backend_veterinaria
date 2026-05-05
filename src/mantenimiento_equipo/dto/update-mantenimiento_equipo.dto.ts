import { PartialType } from '@nestjs/mapped-types';
import { CreateMantenimientoEquipoDto } from './create-mantenimiento_equipo.dto';

export class UpdateMantenimientoEquipoDto extends PartialType(CreateMantenimientoEquipoDto) {}
