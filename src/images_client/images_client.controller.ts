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
import { ImagesClientService } from './images_client.service';
import { CreateImagesClientDto } from './dto/create-images_client.dto';
import { UpdateImagesClientDto } from './dto/update-images_client.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('images-client')
export class ImagesClientController {
  constructor(private readonly imagesClientService: ImagesClientService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @AuthCliente()
  async uploadProfileImage(
    @GetCliente() cliente: Cliente,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.imagesClientService.uploadProfileImage(cliente, file);
  }

  @Get('current')
  @AuthCliente()
  async getCurrentProfileImage(@GetCliente() cliente: Cliente) {
    return this.imagesClientService.getCurrentProfileImage(cliente);
  }

  @Get('all-images')
  @AuthCliente()
  async getImagesByUser(@GetCliente() cliente: Cliente) {
    return this.imagesClientService.getImagesByUser(cliente);
  }

  @Delete(':id')
  @AuthCliente()
  async deleteProfileImage(@Param('id', ParseUUIDPipe) imageId: string) {
    return this.imagesClientService.deleteProfileImage(imageId);
  }
}
