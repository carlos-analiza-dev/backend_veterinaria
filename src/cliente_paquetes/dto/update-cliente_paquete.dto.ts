import { PartialType } from '@nestjs/mapped-types';
import { CreateClientePaqueteDto } from './create-cliente_paquete.dto';

export class UpdateClientePaqueteDto extends PartialType(CreateClientePaqueteDto) {}
