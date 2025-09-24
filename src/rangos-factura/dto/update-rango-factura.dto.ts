import { PartialType } from '@nestjs/mapped-types';
import { CreateRangoFacturaDto } from './create-rango-factura.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoRango } from '../entities/rango-factura.entity';

export class UpdateRangoFacturaDto extends PartialType(CreateRangoFacturaDto) {
  @IsEnum(EstadoRango)
  @IsOptional()
  estado?: EstadoRango;
}