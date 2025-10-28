import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialClinicoDto } from './create-historial_clinico.dto';

export class UpdateHistorialClinicoDto extends PartialType(CreateHistorialClinicoDto) {}
