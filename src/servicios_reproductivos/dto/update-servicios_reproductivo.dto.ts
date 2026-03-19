import { PartialType } from '@nestjs/mapped-types';
import { CreateServiciosReproductivoDto } from './create-servicios_reproductivo.dto';

export class UpdateServiciosReproductivoDto extends PartialType(CreateServiciosReproductivoDto) {}
