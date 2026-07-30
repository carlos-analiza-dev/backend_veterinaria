import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroClienteDto } from './create-agro_cliente.dto';

export class UpdateAgroClienteDto extends PartialType(CreateAgroClienteDto) {}
