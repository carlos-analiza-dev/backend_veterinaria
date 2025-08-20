import { PartialType } from '@nestjs/mapped-types';
import { CreateProveedorDto } from './create-proveedor.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProveedorDto extends PartialType(CreateProveedorDto) {
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  is_active?: boolean;
}
