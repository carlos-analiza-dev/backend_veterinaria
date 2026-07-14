import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroSucursaleDto } from './create-agro-sucursale.dto';

export class UpdateAgroSucursaleDto extends PartialType(CreateAgroSucursaleDto) {}
