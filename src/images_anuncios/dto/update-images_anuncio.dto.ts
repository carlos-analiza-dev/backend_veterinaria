import { PartialType } from '@nestjs/mapped-types';
import { CreateImagesAnuncioDto } from './create-images_anuncio.dto';

export class UpdateImagesAnuncioDto extends PartialType(CreateImagesAnuncioDto) {}
