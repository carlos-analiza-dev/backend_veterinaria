import { PartialType } from '@nestjs/mapped-types';
import { CreateServicioInsumoDto } from './create-servicio_insumo.dto';

export class UpdateServicioInsumoDto extends PartialType(CreateServicioInsumoDto) {}
