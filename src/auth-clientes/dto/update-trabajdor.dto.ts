import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthTrabajadorDto } from './create-trabajador.dto';

export class UpdateAuthTrabajadotDto extends PartialType(
  CreateAuthTrabajadorDto,
) {}
