import { PartialType } from '@nestjs/mapped-types';
import { CreateProductosImageDto } from './create-productos_image.dto';

export class UpdateProductosImageDto extends PartialType(CreateProductosImageDto) {}
