import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoOpinioneDto } from './create-producto_opinione.dto';

export class UpdateProductoOpinioneDto extends PartialType(CreateProductoOpinioneDto) {}
