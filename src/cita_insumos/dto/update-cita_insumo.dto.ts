import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaInsumoDto } from './create-cita_insumo.dto';

export class UpdateCitaInsumoDto extends PartialType(CreateCitaInsumoDto) {}
