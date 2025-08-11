import { PartialType } from '@nestjs/mapped-types';
import { CreateProductosAgroservicioDto } from './create-productos_agroservicio.dto';

export class UpdateProductosAgroservicioDto extends PartialType(CreateProductosAgroservicioDto) {}
