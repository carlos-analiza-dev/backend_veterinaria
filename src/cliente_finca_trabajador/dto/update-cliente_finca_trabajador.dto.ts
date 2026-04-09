import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteFincaTrabajadorDto } from './create-cliente_finca_trabajador.dto';

export class UpdateClienteFincaTrabajadorDto extends PartialType(CreateClienteFincaTrabajadorDto) {}
