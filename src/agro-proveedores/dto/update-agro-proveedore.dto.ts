import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroProveedoreDto } from './create-agro-proveedore.dto';

export class UpdateAgroProveedoreDto extends PartialType(CreateAgroProveedoreDto) {}
