import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroFacturacionDto } from './create-agro_facturacion.dto';

export class UpdateAgroFacturacionDto extends PartialType(CreateAgroFacturacionDto) {}
