import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketplaceVisualizacioneDto } from './create-marketplace_visualizacione.dto';

export class UpdateMarketplaceVisualizacioneDto extends PartialType(CreateMarketplaceVisualizacioneDto) {}
