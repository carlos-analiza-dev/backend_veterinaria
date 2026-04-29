import { PartialType } from '@nestjs/mapped-types';
import { CreateActividadFotoDto } from './create-actividad_foto.dto';

export class UpdateActividadFotoDto extends PartialType(CreateActividadFotoDto) {}
