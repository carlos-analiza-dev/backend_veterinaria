// src/sucursales/dto/update-sucursal.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSucursalDto } from './create-sucursal.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSucursalDto extends PartialType(CreateSucursalDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
