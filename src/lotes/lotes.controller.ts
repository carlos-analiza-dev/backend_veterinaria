import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { SearchLoteDto } from './dto/search-lote.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  create(@Body() createLoteDto: CreateLoteDto, @GetUser() user: User) {
    return this.lotesService.create(createLoteDto, user.id);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll(@Query() searchLoteDto: SearchLoteDto) {
    return this.lotesService.findAll(searchLoteDto);
  }

  @Get('producto/:productoId')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findByProducto(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Query() searchLoteDto: SearchLoteDto,
  ) {
    const searchWithProduct = { ...searchLoteDto, productoId };
    return this.lotesService.findAll(searchWithProduct);
  }

  @Get('proveedor/:proveedorId')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findByProveedor(
    @Param('proveedorId', ParseUUIDPipe) proveedorId: string,
    @Query() searchLoteDto: SearchLoteDto,
  ) {
    const searchWithProveedor = { ...searchLoteDto, proveedorId };
    return this.lotesService.findAll(searchWithProveedor);
  }

  @Get('vencimientos-proximos')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findVencimientosProximos(@Query() searchLoteDto: SearchLoteDto) {
    const searchWithVencimientos = { ...searchLoteDto, vencidosProximos: true };
    return this.lotesService.findAll(searchWithVencimientos);
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
    @GetUser() user: User,
  ) {
    return this.lotesService.update(id, updateLoteDto, user.id);
  }

  @Patch(':id/ajustar-cantidad')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  adjustQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    adjustDto: {
      cantidad: number;
      operacion: 'sumar' | 'restar';
    },
    @GetUser() user: User,
  ) {
    return this.lotesService.adjustQuantity(
      id,
      adjustDto.cantidad,
      user.id,
      adjustDto.operacion,
    );
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.lotesService.remove(id, user.id);
  }

  @Patch('restore/:id')
  @Auth(ValidRoles.Administrador)
  restore(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.lotesService.restore(id, user.id);
  }
}