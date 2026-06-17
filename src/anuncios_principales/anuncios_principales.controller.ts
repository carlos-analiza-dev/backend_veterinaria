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
  Query,
} from '@nestjs/common';
import { AnunciosPrincipalesService } from './anuncios_principales.service';
import { CreateAnunciosPrincipaleDto } from './dto/create-anuncios_principale.dto';
import { UpdateAnunciosPrincipaleDto } from './dto/update-anuncios_principale.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('anuncios-principales')
export class AnunciosPrincipalesController {
  constructor(
    private readonly anunciosPrincipalesService: AnunciosPrincipalesService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('imagenes', 5))
  @Auth()
  create(
    @Body() createAnuncioDto: CreateAnunciosPrincipaleDto,
    @UploadedFiles() imagenes: Express.Multer.File[],
    @GetUser() user: User,
  ) {
    return this.anunciosPrincipalesService.create(
      createAnuncioDto,
      imagenes,
      user,
    );
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.anunciosPrincipalesService.findAll(paginationDto);
  }

  @Get('clients')
  findAllAnuncios() {
    return this.anunciosPrincipalesService.findAllAnuncios();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anunciosPrincipalesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('imagenes', 5))
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateAnunciosPrincipaleDto: UpdateAnunciosPrincipaleDto,
    @UploadedFiles() imagenes: Express.Multer.File[],
  ) {
    return this.anunciosPrincipalesService.update(
      id,
      updateAnunciosPrincipaleDto,
      imagenes,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anunciosPrincipalesService.remove(+id);
  }
}
