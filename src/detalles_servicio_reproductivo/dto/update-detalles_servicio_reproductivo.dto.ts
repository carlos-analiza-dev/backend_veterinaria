import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallesServicioReproductivoDto } from './create-detalles_servicio_reproductivo.dto';

export class UpdateDetallesServicioReproductivoDto extends PartialType(CreateDetallesServicioReproductivoDto) {}
