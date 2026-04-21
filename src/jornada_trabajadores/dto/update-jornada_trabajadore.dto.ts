import { PartialType } from '@nestjs/mapped-types';
import { CreateJornadaTrabajadoreDto } from './create-jornada_trabajadore.dto';

export class UpdateJornadaTrabajadoreDto extends PartialType(CreateJornadaTrabajadoreDto) {}
