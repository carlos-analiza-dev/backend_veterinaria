import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { PaginationDto } from '../common/dto/pagination-common.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../interfaces/valid-roles.interface';

@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Veterinario)
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalesService.create(createSucursalDto);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.sucursalesService.findAll(paginationDto);
  }

  @Get('stats')
  @Auth(ValidRoles.Administrador)
  getStats() {
    return this.sucursalesService.getStats();
  }

  @Get('tipo/:tipo')
  @Auth()
  findByTipo(
    @Param('tipo') tipo: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.sucursalesService.findByTipo(tipo, paginationDto);
  }

  @Get('municipio/:municipioId')
  @Auth()
  findByMunicipio(
    @Param('municipioId', ParseUUIDPipe) municipioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.sucursalesService.findByMunicipio(municipioId, paginationDto);
  }

  @Get('departamento/:departamentoId')
  @Auth()
  findByDepartamento(
    @Param('departamentoId', ParseUUIDPipe) departamentoId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.sucursalesService.findByDepartamento(
      departamentoId,
      paginationDto,
    );
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sucursalesService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Veterinario)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSucursalDto: UpdateSucursalDto,
  ) {
    return this.sucursalesService.update(id, updateSucursalDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sucursalesService.remove(id);
  }
}
