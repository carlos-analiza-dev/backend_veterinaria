import { PartialType } from '@nestjs/mapped-types';
import { CreateImagesClientDto } from './create-images_client.dto';

export class UpdateImagesClientDto extends PartialType(CreateImagesClientDto) {}
