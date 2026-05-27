import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketplaceAnimaleDto } from './create-marketplace_animale.dto';

export class UpdateMarketplaceAnimaleDto extends PartialType(CreateMarketplaceAnimaleDto) {}
