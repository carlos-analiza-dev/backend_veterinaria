import { IsUUID } from 'class-validator';

export class CreateMarketplaceVisualizacioneDto {
  @IsUUID()
  publicacionId: string;
}
