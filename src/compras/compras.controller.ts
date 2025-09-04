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
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/auth.entity';
import { ValidRoles } from '../interfaces/valid-roles.interface';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('compras')
@Auth()
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  create(
    @Body() createCompraDto: CreateCompraDto,
    @GetUser() user: User,
  ) {
    return this.comprasService.create(createCompraDto, user);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.comprasService.findAll(paginationDto);
  }

  @Get('existencias/:productoId')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  getExistenciasProducto(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    return this.comprasService.getExistenciasProducto(productoId, sucursalId);
  }

  @Post('reducir-inventario')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  reducirInventario(
    @Body() body: {
      productoId: string;
      sucursalId: string;
      cantidad: number;
    },
  ) {
    return this.comprasService.reducirInventario(
      body.productoId,
      body.sucursalId,
      body.cantidad,
    );
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.comprasService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompraDto: UpdateCompraDto,
    @GetUser() user: User,
  ) {
    return this.comprasService.update(id, updateCompraDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.comprasService.remove(id);
  }
}