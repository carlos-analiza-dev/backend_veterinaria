import { PartialType } from '@nestjs/mapped-types';
import { CreatePesoHistorialDto } from './create-peso_historial.dto';

export class UpdatePesoHistorialDto extends PartialType(CreatePesoHistorialDto) {}
