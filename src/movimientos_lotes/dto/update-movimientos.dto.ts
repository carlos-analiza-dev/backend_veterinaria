import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientosLoteDto } from './create-movimientos.dto';

export class UpdateMovimientosLoteDto extends PartialType(
  CreateMovimientosLoteDto,
) {}
