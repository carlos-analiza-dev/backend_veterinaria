import { PartialType } from '@nestjs/mapped-types';
import { CreatePermisosClientesAgroDto } from './create-permisos_clientes_agro.dto';

export class UpdatePermisosClientesAgroDto extends PartialType(CreatePermisosClientesAgroDto) {}
