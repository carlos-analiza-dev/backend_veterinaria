import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MarketplaceAnimalesImagesService } from './marketplace_animales_images.service';
import { CreateMarketplaceAnimalesImageDto } from './dto/create-marketplace_animales_image.dto';
import { UpdateMarketplaceAnimalesImageDto } from './dto/update-marketplace_animales_image.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('marketplace-animales-images')
export class MarketplaceAnimalesImagesController {
  constructor(
    private readonly marketplaceAnimalesImagesService: MarketplaceAnimalesImagesService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body()
    createMarketplaceAnimalesImageDto: CreateMarketplaceAnimalesImageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.marketplaceAnimalesImagesService.uploadFotos(
      createMarketplaceAnimalesImageDto,
      files,
    );
  }

  @Get()
  findAll() {
    return this.marketplaceAnimalesImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketplaceAnimalesImagesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateMarketplaceAnimalesImageDto: UpdateMarketplaceAnimalesImageDto,
  ) {
    return this.marketplaceAnimalesImagesService.update(
      +id,
      updateMarketplaceAnimalesImageDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketplaceAnimalesImagesService.remove(+id);
  }
}
