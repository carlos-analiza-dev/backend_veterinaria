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
import { AgroFacturacionService } from './agro_facturacion.service';
import { CreateAgroFacturacionDto } from './dto/create-agro_facturacion.dto';
import { UpdateAgroFacturacionDto } from './dto/update-agro_facturacion.dto';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('agro-facturacion')
export class AgroFacturacionController {
  constructor(
    private readonly agroFacturacionService: AgroFacturacionService,
  ) {}

  @Post()
  @AuthEmpleado()
  create(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createAgroFacturacionDto: CreateAgroFacturacionDto,
  ) {
    return this.agroFacturacionService.create(
      empleado,
      createAgroFacturacionDto,
    );
  }

  @Get('agroservicio/:propietarioid')
  findAll(
    @Param('propietarioid') propietarioid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroFacturacionService.findAll(propietarioid, paginationDto);
  }

  @Get('procesadas/:propietarioid')
  findAllProcesadas(
    @Param('propietarioid') propietarioid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroFacturacionService.findAllProcesadas(
      propietarioid,
      paginationDto,
    );
  }

  @Get('cliente/:clienteId')
  findProductosFrecuentes(
    @Param('clienteId') clienteId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroFacturacionService.findProductosFrecuentes(
      clienteId,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroFacturacionService.findOne(+id);
  }

  @Patch(':id')
  @AuthEmpleado()
  update(
    @Param('id') id: string,
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() updateAgroFacturacionDto: UpdateAgroFacturacionDto,
  ) {
    return this.agroFacturacionService.update(
      id,
      empleado,
      updateAgroFacturacionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroFacturacionService.remove(+id);
  }

  @Patch(':id/procesar')
  procesarFactura(@Param('id') id: string) {
    return this.agroFacturacionService.procesarFactura(id);
  }

  @Get(':id/:sucursalId/verificar-existencia')
  verificarExistencia(
    @Param('id') id: string,
    @Param('sucursalId') sucursalId: string,
  ) {
    return this.agroFacturacionService.verificarExistenciaParaFactura(
      id,
      sucursalId,
    );
  }

  @Patch(':id/autorizar-cancelacion')
  @AuthCliente()
  async autorizarCancelacion(
    @Param('id') id: string,
    @GetCliente() cliente: Cliente,
  ) {
    return this.agroFacturacionService.autorizarCancelacion(id, cliente);
  }

  @Patch(':id/cancelar')
  cancelarFactura(@Param('id') id: string) {
    return this.agroFacturacionService.cancelarFactura(id);
  }
}
