import { PartialType } from '@nestjs/mapped-types';
import { CreateInventarioProductosGanaderiaDto } from './create-inventario_productos_ganaderia.dto';

export class UpdateInventarioProductosGanaderiaDto extends PartialType(CreateInventarioProductosGanaderiaDto) {}
