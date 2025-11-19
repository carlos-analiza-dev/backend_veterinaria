import { PartialType } from '@nestjs/mapped-types';
import { CreateClientePermisoDto } from './create-cliente_permiso.dto';

export class UpdateClientePermisoDto extends PartialType(CreateClientePermisoDto) {}
