import { PartialType } from '@nestjs/mapped-types';
import { CreateLogosAgroservicioDto } from './create-logos-agroservicio.dto';

export class UpdateLogosAgroservicioDto extends PartialType(CreateLogosAgroservicioDto) {}
