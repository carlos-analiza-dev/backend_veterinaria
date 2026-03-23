import { PartialType } from '@nestjs/mapped-types';
import { CreatePartoAnimalDto } from './create-parto_animal.dto';

export class UpdatePartoAnimalDto extends PartialType(CreatePartoAnimalDto) {}
