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
import { Auth } from 'src/auth/decorators/auth.decorator';
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
  @Auth()
  async getCurrentProfileImage(@Param('animalId') animalId: string) {
    return this.imagesAminalesService.getCurrentProfileImage(animalId);
  }

  @Get('all-images/:animalId')
  @Auth()
  async getImagesByUser(@Param('animalId') animalId: string) {
    return this.imagesAminalesService.getImagesByUser(animalId);
  }

  @Delete(':id')
  @Auth()
  async deleteProfileImage(@Param('id', ParseUUIDPipe) imageId: string) {
    return this.imagesAminalesService.deleteProfileImage(imageId);
  }
}
