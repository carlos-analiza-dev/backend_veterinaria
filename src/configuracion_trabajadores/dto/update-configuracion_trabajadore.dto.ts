import { PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracionTrabajadoreDto } from './create-configuracion_trabajadore.dto';

export class UpdateConfiguracionTrabajadoreDto extends PartialType(CreateConfiguracionTrabajadoreDto) {}
