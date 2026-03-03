import { PartialType } from '@nestjs/mapped-types';
import { CreateProductosGanaderiaDto } from './create-productos_ganaderia.dto';

export class UpdateProductosGanaderiaDto extends PartialType(CreateProductosGanaderiaDto) {}
