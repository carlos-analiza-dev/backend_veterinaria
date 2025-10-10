import { PartialType } from '@nestjs/mapped-types';
import { CreateProductosNoVendidoDto } from './create-productos_no_vendido.dto';

export class UpdateProductosNoVendidoDto extends PartialType(CreateProductosNoVendidoDto) {}
