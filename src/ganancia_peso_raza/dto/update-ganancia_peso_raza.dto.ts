import { PartialType } from '@nestjs/mapped-types';
import { CreateGananciaPesoRazaDto } from './create-ganancia_peso_raza.dto';

export class UpdateGananciaPesoRazaDto extends PartialType(CreateGananciaPesoRazaDto) {}
