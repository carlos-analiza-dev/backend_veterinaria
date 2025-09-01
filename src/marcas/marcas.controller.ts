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
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { SearchMarcaDto } from './dto/search-marca.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Post()
  @Auth(ValidRoles.Administrador)
  create(@Body() createMarcaDto: CreateMarcaDto, @GetUser() user: User) {
    return this.marcasService.create(createMarcaDto, user.id);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll(@Query() searchMarcaDto: SearchMarcaDto) {
    return this.marcasService.findAll(searchMarcaDto);
  }

  @Get('activas')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAllActive() {
    return this.marcasService.findAllActive();
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id') id: string) {
    return this.marcasService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador)
  update(
    @Param('id') id: string,
    @Body() updateMarcaDto: UpdateMarcaDto,
    @GetUser() user: User,
  ) {
    return this.marcasService.update(id, updateMarcaDto, user.id);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.marcasService.remove(id, user.id);
  }

  @Patch('restore/:id')
  @Auth(ValidRoles.Administrador)
  restore(@Param('id') id: string, @GetUser() user: User) {
    return this.marcasService.restore(id, user.id);
  }
}
