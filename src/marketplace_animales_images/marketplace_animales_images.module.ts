import { Module } from '@nestjs/common';
import { MarketplaceAnimalesImagesService } from './marketplace_animales_images.service';
import { MarketplaceAnimalesImagesController } from './marketplace_animales_images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceAnimale } from 'src/marketplace_animales/entities/marketplace_animale.entity';
import { MarketplaceAnimalesImage } from './entities/marketplace_animales_image.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';

@Module({
  controllers: [MarketplaceAnimalesImagesController],
  imports: [
    TypeOrmModule.forFeature([
      MarketplaceAnimalesImage,
      MarketplaceAnimale,
      AnimalFinca,
    ]),
  ],
  providers: [MarketplaceAnimalesImagesService],
})
export class MarketplaceAnimalesImagesModule {}
