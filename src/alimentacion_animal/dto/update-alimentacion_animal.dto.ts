import { PartialType } from '@nestjs/mapped-types';
import { CreateAlimentacionAnimalDto } from './create-alimentacion_animal.dto';

export class UpdateAlimentacionAnimalDto extends PartialType(CreateAlimentacionAnimalDto) {}
