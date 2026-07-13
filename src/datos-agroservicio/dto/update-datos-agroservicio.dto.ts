import { PartialType } from '@nestjs/mapped-types';
import { CreateDatosAgroservicioDto } from './create-datos-agroservicio.dto';

export class UpdateDatosAgroservicioDto extends PartialType(CreateDatosAgroservicioDto) {}
