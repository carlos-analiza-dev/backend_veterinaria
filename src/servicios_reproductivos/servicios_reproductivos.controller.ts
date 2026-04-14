import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ServiciosReproductivosService } from './servicios_reproductivos.service';
import { CreateServiciosReproductivoDto } from './dto/create-servicios_reproductivo.dto';
import { UpdateServiciosReproductivoDto } from './dto/update-servicios_reproductivo.dto';
import { FilterServiciosDto } from './dto/filter-servicios.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { UpdateEstadoServicioDto } from './dto/update-estado-servicio.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';

@Controller('servicios-reproductivos')
export class ServiciosReproductivosController {
  constructor(
    private readonly serviciosReproductivosService: ServiciosReproductivosService,
  ) {}

  @Post()
  @AuthCliente()
  async create(
    @Body() createDto: CreateServiciosReproductivoDto,
    @GetCliente() cliente: Cliente,
  ) {
    const servicio = await this.serviciosReproductivosService.create(
      createDto,
      cliente,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Servicio reproductivo creado exitosamente',
      data: servicio,
    };
  }

  @Get()
  @AuthCliente()
  async findAll(@Query() filters: FilterServiciosDto) {
    const result = await this.serviciosReproductivosService.findAll(filters);
    return result;
  }

  @Get(':id')
  @AuthCliente()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const servicio = await this.serviciosReproductivosService.findOne(id);
    return servicio;
  }

  @Get('/hembra/:id')
  @AuthCliente()
  async findAllHembraId(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.serviciosReproductivosService.findAllHembraId(id);
    return result;
  }

  @Patch(':id')
  @AuthCliente()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateServiciosReproductivoDto,
    @GetCliente() cliente: Cliente,
  ) {
    const servicio = await this.serviciosReproductivosService.update(
      id,
      updateDto,
      cliente,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Servicio reproductivo actualizado exitosamente',
      data: servicio,
    };
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoServicioDto,
  ) {
    return this.serviciosReproductivosService.actualizarEstadoServicio(id, dto);
  }

  @Delete(':id')
  @AuthCliente()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.serviciosReproductivosService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Get('hembra/:hembraId')
  @AuthCliente()
  async getPorHembra(@Param('hembraId', ParseUUIDPipe) hembraId: string) {
    const servicios =
      await this.serviciosReproductivosService.getServiciosPorHembra(hembraId);
    return {
      statusCode: HttpStatus.OK,
      data: servicios,
    };
  }

  @Get('pendientes/finca/:fincaId')
  @AuthCliente()
  async getPendientes(@Param('fincaId', ParseUUIDPipe) fincaId: string) {
    const servicios =
      await this.serviciosReproductivosService.getServiciosPendientes(fincaId);
    return {
      statusCode: HttpStatus.OK,
      data: servicios,
    };
  }

  @Get('estadisticas/finca/:fincaId')
  @AuthCliente()
  async getEstadisticas(
    @Param('fincaId', ParseUUIDPipe) fincaId: string,
    @Query('periodo') periodo: 'semana' | 'mes' | 'año' = 'mes',
  ) {
    const estadisticas =
      await this.serviciosReproductivosService.getEstadisticasPorFinca(
        fincaId,
        periodo,
      );
    return {
      statusCode: HttpStatus.OK,
      data: estadisticas,
    };
  }
}
