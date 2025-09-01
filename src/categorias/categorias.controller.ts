// src/categorias/categorias.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { SearchCategoriaDto } from './dto/search-categoria.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @Auth(ValidRoles.Administrador)
  create(
    @Body() createCategoriaDto: CreateCategoriaDto,
    @GetUser() user: User,
  ) {
    return this.categoriasService.create(createCategoriaDto, user.id);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll(@Query() searchCategoriaDto: SearchCategoriaDto) {
    return this.categoriasService.findAll(searchCategoriaDto);
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador)
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
    @GetUser() user: User,
  ) {
    return this.categoriasService.update(id, updateCategoriaDto, user.id);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.categoriasService.remove(id, user.id);
  }
}
