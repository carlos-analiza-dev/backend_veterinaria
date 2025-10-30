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
import { FacturaEncabezadoService } from './factura_encabezado.service';
import { CreateFacturaEncabezadoDto } from './dto/create-factura_encabezado.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { UpdateFacturaEncabezadoDto } from './dto/update-factura-encabezado.dto';

@Controller('factura-encabezado')
export class FacturaEncabezadoController {
  constructor(
    private readonly facturaEncabezadoService: FacturaEncabezadoService,
  ) {}

  @Post()
  @Auth()
  create(
    @GetUser() user: User,
    @Body() createFacturaEncabezadoDto: CreateFacturaEncabezadoDto,
  ) {
    return this.facturaEncabezadoService.create(
      user,
      createFacturaEncabezadoDto,
    );
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.facturaEncabezadoService.findAll(user, paginationDto);
  }

  @Get('/procesadas')
  @Auth()
  findAllProcesadas(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.facturaEncabezadoService.findAllProcesadas(user, paginationDto);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateFacturaEncabezadoDto: UpdateFacturaEncabezadoDto,
  ) {
    return this.facturaEncabezadoService.update(id, updateFacturaEncabezadoDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.facturaEncabezadoService.remove(id);
  }

  @Patch(':id/procesar')
  @Auth()
  procesarFactura(@Param('id') id: string) {
    return this.facturaEncabezadoService.procesarFactura(id);
  }

  @Get(':id/verificar-existencia')
  @Auth()
  verificarExistencia(@Param('id') id: string) {
    return this.facturaEncabezadoService.verificarExistenciaParaFactura(id);
  }

  @Patch(':id/autorizar-cancelacion')
  @Auth()
  async autorizarCancelacion(@Param('id') id: string, @GetUser() user: User) {
    return this.facturaEncabezadoService.autorizarCancelacion(id, user);
  }

  @Patch(':id/cancelar')
  @Auth()
  cancelarFactura(@Param('id') id: string, @GetUser() user: User) {
    return this.facturaEncabezadoService.cancelarFactura(id, user);
  }
}
