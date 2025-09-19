import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ImagesAminalesService } from './images_aminales.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';

@Controller('images-aminales')
export class ImagesAminalesController {
  constructor(private readonly imagesAminalesService: ImagesAminalesService) {}

  @Post('upload/:animalId')
  @UseInterceptors(FileInterceptor('file'))
  @AuthCliente()
  async uploadProfileImage(
    @Param('animalId', ParseUUIDPipe) animalId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.imagesAminalesService.uploadProfileImage(animalId, file);
  }

  @Get('current/:animalId')
  @AuthCliente()
  async getCurrentProfileImage(@Param('animalId') animalId: string) {
    return this.imagesAminalesService.getCurrentProfileImage(animalId);
  }

  @Get('all-images/:animalId')
  @AuthCliente()
  async getImagesByUser(@Param('animalId') animalId: string) {
    return this.imagesAminalesService.getImagesByUser(animalId);
  }

  @Delete(':id')
  @AuthCliente()
  async deleteProfileImage(@Param('id', ParseUUIDPipe) imageId: string) {
    return this.imagesAminalesService.deleteProfileImage(imageId);
  }
}
