import { PartialType } from '@nestjs/mapped-types';
import { CreateCodigosPaqueteDto } from './create-codigos_paquete.dto';

export class UpdateCodigosPaqueteDto extends PartialType(CreateCodigosPaqueteDto) {}
