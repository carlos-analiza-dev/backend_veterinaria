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
import { FilterSucursalDto } from './dto/filter-sucursal.dto';
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
  findAll(@Query() filterDto: FilterSucursalDto) {
    return this.sucursalesService.findAll(filterDto);
  }

  @Get('active')
  @Auth()
  findAllActive(@Query() paginationDto: PaginationDto) {
    return this.sucursalesService.findAllActive(paginationDto);
  }

  @Get('pais/:paisId')
  @Auth()
  findByPais(
    @Param('paisId', ParseUUIDPipe) paisId: string,
    @Query() filterDto: FilterSucursalDto,
  ) {
    return this.sucursalesService.findByPais(paisId, filterDto);
  }

  @Get('pais-suc/:paisId')
  findByPaisFree(@Param('paisId', ParseUUIDPipe) paisId: string) {
    return this.sucursalesService.findByPaisFree(paisId);
  }

  @Get('stats')
  @Auth(ValidRoles.Administrador)
  getStats(@Query('paisId') paisId?: string) {
    return this.sucursalesService.getStats(paisId);
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
