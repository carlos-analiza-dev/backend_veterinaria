import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroRangoFacturaDto } from './create-rango-factura.dto';

export class UpdateAgroRangoFacturaDto extends PartialType(
  CreateAgroRangoFacturaDto,
) {}
