import { PartialType } from '@nestjs/mapped-types';
import { CreateFacturaEncabezadoDto } from './create-factura_encabezado.dto';

export class UpdateFacturaEncabezadoDto extends PartialType(CreateFacturaEncabezadoDto) {}
