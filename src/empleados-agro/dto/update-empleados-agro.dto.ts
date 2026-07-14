import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadosAgroDto } from './create-empleados-agro.dto';

export class UpdateEmpleadosAgroDto extends PartialType(CreateEmpleadosAgroDto) {}
