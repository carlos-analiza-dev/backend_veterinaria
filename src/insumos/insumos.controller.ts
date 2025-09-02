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
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  create(@Body() createInsumoDto: CreateInsumoDto) {
    return this.insumosService.create(createInsumoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.insumosService.findAll(paginationDto);
  }

  @Get('insumos-disponibles')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findInsumosDisponibles(@GetUser() user: User) {
    return this.insumosService.findInsumosDisponibles(user);
  }

  @Get('insumos-sin-inventario')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findInsumosSinInventario(@GetUser() user: User) {
    return this.insumosService.findInsumosSinInventario(user);
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  update(@Param('id') id: string, @Body() updateInsumoDto: UpdateInsumoDto) {
    return this.insumosService.update(id, updateInsumoDto);
  }
}
