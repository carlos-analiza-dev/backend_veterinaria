import { PartialType } from '@nestjs/mapped-types';
import { CreateActividadesDiariaDto } from './create-actividades_diaria.dto';

export class UpdateActividadesDiariaDto extends PartialType(CreateActividadesDiariaDto) {}
