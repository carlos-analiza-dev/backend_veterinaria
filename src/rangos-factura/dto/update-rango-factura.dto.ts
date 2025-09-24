import { PartialType } from '@nestjs/mapped-types';
import { CreateRangoFacturaDto } from './create-rango-factura.dto';

export class UpdateRangoFacturaDto extends PartialType(CreateRangoFacturaDto) {}
