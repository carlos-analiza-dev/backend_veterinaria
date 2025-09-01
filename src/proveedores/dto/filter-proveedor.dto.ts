import { IsOptional, IsUUID } from 'class-validator';
import { SearchProveedorDto } from './search-proveedor.dto';

export class FilterProveedorDto extends SearchProveedorDto {
  @IsUUID('4', { message: 'El paisId debe ser un UUID válido' })
  @IsOptional()
  paisId?: string;
}
