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
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { ReducirInventarioDto } from './dto/reducir-inventario.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

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

  @Get('existencias')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  getExistenciasByProducto(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.lotesService.getExistenciasByProducto(user, paginationDto);
  }

  @Post('reducir-inventario')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  reducirInventario(@Body() reducirInventarioDto: ReducirInventarioDto) {
    return this.lotesService.reducirInventario(
      reducirInventarioDto.id_producto,
      reducirInventarioDto.id_sucursal,
      reducirInventarioDto.cantidad,
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
