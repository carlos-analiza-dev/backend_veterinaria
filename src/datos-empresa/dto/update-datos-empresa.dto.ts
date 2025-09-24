import { PartialType } from '@nestjs/mapped-types';
import { CreateDatosEmpresaDto } from './create-datos-empresa.dto';

export class UpdateDatosEmpresaDto extends PartialType(CreateDatosEmpresaDto) {}