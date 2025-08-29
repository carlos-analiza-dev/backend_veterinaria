import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ParseUUIDPipe,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProductosImagesService } from './productos_images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('productos-images')
export class ProductosImagesController {
  constructor(
    private readonly productosImagesService: ProductosImagesService,
  ) {}

  @Post('upload/:productoId')
  @UseInterceptors(FileInterceptor('file'))
  @Auth()
  async uploadProfileImage(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.productosImagesService.uploadProfileImageProducto(
      productoId,
      file,
    );
  }

  @Delete(':id')
  @Auth()
  async deleteProfileImage(@Param('id', ParseUUIDPipe) imageId: string) {
    return this.productosImagesService.deleteProfileImage(imageId);
  }

  /*   @Get('current/:productoId')
  @Auth()
  async getCurrentProfileImage(@Param('productoId') productoId: string) {
    return this.productosImagesService.getCurrentProfileImage(productoId);
  }

  @Get('all-images/:productoId')
  @Auth()
  async getImagesByUser(@Param('productoId') productoId: string) {
    return this.productosImagesService.getImagesByUser(productoId);
  }

  @Delete(':id')
  @Auth()
  async deleteProfileImage(@Param('id', ParseUUIDPipe) imageId: string) {
    return this.productosImagesService.deleteProfileImage(imageId);
  } */
}
