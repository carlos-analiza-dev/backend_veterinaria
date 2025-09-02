import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
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
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll() {
    return this.insumosService.findAll();
  }

  @Get('insumos-disponibles')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findInsumosDisponibles() {
    return this.insumosService.findInsumosDisponibles();
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

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id') id: string) {
    return this.insumosService.remove(id);
  }
}
