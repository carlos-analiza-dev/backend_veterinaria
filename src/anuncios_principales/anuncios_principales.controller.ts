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
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

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
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.anunciosPrincipalesService.findAll(user, paginationDto);
  }

  @Get('clients')
  @AuthCliente()
  findAllAnuncios(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.anunciosPrincipalesService.findAllAnuncios(
      cliente,
      paginationDto,
    );
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
