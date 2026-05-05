import { PartialType } from '@nestjs/mapped-types';
import { CreateConsumoEquipoDto } from './create-consumo_equipo.dto';

export class UpdateConsumoEquipoDto extends PartialType(CreateConsumoEquipoDto) {}
