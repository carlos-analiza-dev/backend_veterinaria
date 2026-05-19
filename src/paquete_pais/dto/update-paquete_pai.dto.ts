import { PartialType } from '@nestjs/mapped-types';
import { CreatePaquetePaiDto } from './create-paquete_pai.dto';

export class UpdatePaquetePaiDto extends PartialType(CreatePaquetePaiDto) {}
