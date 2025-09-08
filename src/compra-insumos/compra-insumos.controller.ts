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
import { CompraInsumosService } from './compra-insumos.service';
import { CreateCompraInsumoDto } from './dto/create-compra-insumo.dto';
import { UpdateCompraInsumoDto } from './dto/update-compra-insumo.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/auth.entity';
import { ValidRoles } from '../interfaces/valid-roles.interface';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('compra-insumos')
@Auth()
export class CompraInsumosController {
  constructor(private readonly compraInsumosService: CompraInsumosService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  create(
    @Body() createCompraInsumoDto: CreateCompraInsumoDto,
    @GetUser() user: User,
  ) {
    return this.compraInsumosService.create(createCompraInsumoDto, user);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.compraInsumosService.findAll(user, paginationDto);
  }

  @Get('existencias-insumos')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  getExistenciasInsumos(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.compraInsumosService.getExistenciasInsumos(user, paginationDto);
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.compraInsumosService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompraInsumoDto: UpdateCompraInsumoDto,
    @GetUser() user: User,
  ) {
    return this.compraInsumosService.update(id, updateCompraInsumoDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.compraInsumosService.remove(id);
  }
}
