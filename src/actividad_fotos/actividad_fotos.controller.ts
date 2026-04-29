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
import { ActividadFotosService } from './actividad_fotos.service';
import { CreateActividadFotoDto } from './dto/create-actividad_foto.dto';
import { UpdateActividadFotoDto } from './dto/update-actividad_foto.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('actividad-fotos')
export class ActividadFotosController {
  constructor(private readonly actividadFotosService: ActividadFotosService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createActividadFotoDto: CreateActividadFotoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.actividadFotosService.uploadFotos(
      createActividadFotoDto,
      files,
    );
  }

  @Get()
  findAll() {
    return this.actividadFotosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadFotosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActividadFotoDto: UpdateActividadFotoDto,
  ) {
    return this.actividadFotosService.update(+id, updateActividadFotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadFotosService.remove(+id);
  }
}
