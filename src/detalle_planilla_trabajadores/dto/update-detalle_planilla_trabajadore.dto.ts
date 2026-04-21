import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallePlanillaTrabajadoreDto } from './create-detalle_planilla_trabajadore.dto';

export class UpdateDetallePlanillaTrabajadoreDto extends PartialType(CreateDetallePlanillaTrabajadoreDto) {}
