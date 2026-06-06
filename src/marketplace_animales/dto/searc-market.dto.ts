import { IsOptional, IsString } from 'class-validator';

export class SearchMarketplaceDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}
