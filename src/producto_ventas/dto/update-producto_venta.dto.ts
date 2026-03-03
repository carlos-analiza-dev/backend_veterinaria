import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoVentaDto } from './create-producto_venta.dto';

export class UpdateProductoVentaDto extends PartialType(CreateProductoVentaDto) {}
