import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PagosPlanesService } from './pagos_planes.service';
import { CreatePagosPlaneDto } from './dto/create-pagos_plane.dto';
import { UpdatePagosPlaneDto } from './dto/update-pagos_plane.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('pagos-planes')
export class PagosPlanesController {
  constructor(private readonly pagosPlanesService: PagosPlanesService) {}

  @Post('wompi')
  @AuthCliente()
  async crearPago(
    @GetCliente() cliente: Cliente,
    @Body() createPagosPlaneDto: CreatePagosPlaneDto,
  ) {
    return this.pagosPlanesService.crearPago(cliente, createPagosPlaneDto);
  }

  @Get()
  findAll() {
    return this.pagosPlanesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosPlanesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePagosPlaneDto: UpdatePagosPlaneDto,
  ) {
    return this.pagosPlanesService.update(+id, updatePagosPlaneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosPlanesService.remove(+id);
  }
}
