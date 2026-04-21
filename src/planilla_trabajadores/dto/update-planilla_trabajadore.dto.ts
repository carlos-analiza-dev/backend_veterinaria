import { PartialType } from '@nestjs/mapped-types';
import { CrearPlanillaTrabajadoresDto } from './create-planilla_trabajadore.dto';

export class UpdatePlanillaTrabajadoreDto extends PartialType(
  CrearPlanillaTrabajadoresDto,
) {}
