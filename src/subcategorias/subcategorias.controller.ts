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
import { SubcategoriasService } from './subcategorias.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { SearchSubcategoriaDto } from './dto/search-subcategoria.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('subcategorias')
export class SubcategoriasController {
  constructor(private readonly subcategoriasService: SubcategoriasService) {}

  @Post()
  @Auth(ValidRoles.Administrador)
  create(
    @Body() createSubcategoriaDto: CreateSubcategoriaDto,
    @GetUser() user: User,
  ) {
    return this.subcategoriasService.create(createSubcategoriaDto, user.id);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll(@Query() searchSubcategoriaDto: SearchSubcategoriaDto) {
    return this.subcategoriasService.findAll(searchSubcategoriaDto);
  }

  @Get('categoria/:categoriaId')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findByCategoria(@Param('categoriaId') categoriaId: string) {
    return this.subcategoriasService.findByCategoria(categoriaId);
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id') id: string) {
    return this.subcategoriasService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador)
  update(
    @Param('id') id: string,
    @Body() updateSubcategoriaDto: UpdateSubcategoriaDto,
    @GetUser() user: User,
  ) {
    return this.subcategoriasService.update(id, updateSubcategoriaDto, user.id);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.subcategoriasService.remove(id, user.id);
  }
}
