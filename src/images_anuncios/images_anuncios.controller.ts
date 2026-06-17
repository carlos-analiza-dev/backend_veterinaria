import {
  Controller,
  Post,
  Param,
  Delete,
  UseInterceptors,
  ParseUUIDPipe,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ImagesAnunciosService } from './images_anuncios.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('images-anuncios')
export class ImagesAnunciosController {
  constructor(private readonly imagesAnunciosService: ImagesAnunciosService) {}

  @Post('upload/:anuncioId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Param('anuncioId', ParseUUIDPipe) anuncioId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.imagesAnunciosService.uploadAnuncioImage(anuncioId, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesAnunciosService.deleteImageById(id);
  }
}
