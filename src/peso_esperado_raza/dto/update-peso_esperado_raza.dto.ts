import { PartialType } from '@nestjs/mapped-types';
import { CreatePesoEsperadoRazaDto } from './create-peso_esperado_raza.dto';

export class UpdatePesoEsperadoRazaDto extends PartialType(CreatePesoEsperadoRazaDto) {}
