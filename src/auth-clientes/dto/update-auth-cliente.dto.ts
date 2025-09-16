import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthClienteDto } from './create-auth-cliente.dto';

export class UpdateAuthClienteDto extends PartialType(CreateAuthClienteDto) {}
