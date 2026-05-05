import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoMaquinariaDto } from './create-equipo_maquinaria.dto';

export class UpdateEquipoMaquinariaDto extends PartialType(CreateEquipoMaquinariaDto) {}
