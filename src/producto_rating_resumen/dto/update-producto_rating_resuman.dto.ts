import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoRatingResumanDto } from './create-producto_rating_resuman.dto';

export class UpdateProductoRatingResumanDto extends PartialType(CreateProductoRatingResumanDto) {}
