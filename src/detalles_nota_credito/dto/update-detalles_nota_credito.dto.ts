import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallesNotaCreditoDto } from './create-detalles_nota_credito.dto';

export class UpdateDetallesNotaCreditoDto extends PartialType(CreateDetallesNotaCreditoDto) {}
