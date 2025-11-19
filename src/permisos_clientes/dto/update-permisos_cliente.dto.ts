import { PartialType } from '@nestjs/mapped-types';
import { CreatePermisosClienteDto } from './create-permisos_cliente.dto';

export class UpdatePermisosClienteDto extends PartialType(CreatePermisosClienteDto) {}
