import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaCreditoDto } from './create-nota_credito.dto';

export class UpdateNotaCreditoDto extends PartialType(CreateNotaCreditoDto) {}
