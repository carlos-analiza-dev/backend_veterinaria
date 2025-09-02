import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('lotes')
@Auth()
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  create(@Body() createLoteDto: CreateLoteDto) {
    return this.lotesService.create(createLoteDto);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll() {
    return this.lotesService.findAll();
  }

  @Get('producto/:id_producto')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findByProducto(@Param('id_producto', ParseUUIDPipe) id_producto: string) {
    return this.lotesService.findByProducto(id_producto);
  }

  @Get('sucursal/:id_sucursal')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findBySucursal(@Param('id_sucursal', ParseUUIDPipe) id_sucursal: string) {
    return this.lotesService.findBySucursal(id_sucursal);
  }

  @Get('existencias/:id_producto')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  getExistenciasByProducto(
    @Param('id_producto', ParseUUIDPipe) id_producto: string,
    @Body() body?: { id_sucursal?: string },
  ) {
    return this.lotesService.getExistenciasByProducto(id_producto, body?.id_sucursal);
  }

  @Post('reducir-inventario')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  reducirInventario(
    @Body() body: { id_producto: string; id_sucursal: string; cantidad: number },
  ) {
    return this.lotesService.reducirInventario(
      body.id_producto,
      body.id_sucursal,
      body.cantidad,
    );
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotesService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLoteDto: UpdateLoteDto,
  ) {
    return this.lotesService.update(id, updateLoteDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotesService.remove(id);
  }
}