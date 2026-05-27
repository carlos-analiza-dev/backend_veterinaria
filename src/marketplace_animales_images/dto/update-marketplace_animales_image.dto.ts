import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketplaceAnimalesImageDto } from './create-marketplace_animales_image.dto';

export class UpdateMarketplaceAnimalesImageDto extends PartialType(CreateMarketplaceAnimalesImageDto) {}
