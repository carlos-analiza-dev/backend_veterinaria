import { PartialType } from '@nestjs/mapped-types';
import { CreateDescuentosClienteDto } from './create-descuentos_cliente.dto';

export class UpdateDescuentosClienteDto extends PartialType(CreateDescuentosClienteDto) {}
