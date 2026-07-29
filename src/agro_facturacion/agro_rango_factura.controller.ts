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
import { CreateAgroRangoFacturaDto } from './dto/create-rango-factura.dto';
import { UpdateAgroRangoFacturaDto } from './dto/update-rango-factura.dto';
import { AgroRangoFacturaService } from './agro-rango-factura.service';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Controller('agro-rango-factura')
export class AgroRangoFacturaController {
  constructor(
    private readonly agroRangoFacturaService: AgroRangoFacturaService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createRangoFacturaDto: CreateAgroRangoFacturaDto,
  ) {
    return this.agroRangoFacturaService.create(cliente, createRangoFacturaDto);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createRangoFacturaDto: CreateAgroRangoFacturaDto,
  ) {
    return this.agroRangoFacturaService.createEmpleado(
      empleado,
      createRangoFacturaDto,
    );
  }

  @Get('agroservicio/:propietarioId')
  findAll(
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroRangoFacturaService.findAll(propietarioId, paginationDto);
  }

  @Get('activo')
  obtenerActivo() {
    return this.agroRangoFacturaService.obtenerRangoActivo();
  }

  @Get('siguiente-numero')
  obtenerSiguienteNumero() {
    return this.agroRangoFacturaService.obtenerSiguienteNumero();
  }

  @Post('verificar-vencimientos')
  verificarVencimientos() {
    return this.agroRangoFacturaService.verificarVencimientos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroRangoFacturaService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @GetCliente() cliente: Cliente,
    @Body() updateRangoFacturaDto: UpdateAgroRangoFacturaDto,
  ) {
    return this.agroRangoFacturaService.update(
      id,
      cliente,
      updateRangoFacturaDto,
    );
  }

  @Patch('empleado/:id')
  @AuthEmpleado()
  updateEmpleado(
    @Param('id') id: string,
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() updateRangoFacturaDto: UpdateAgroRangoFacturaDto,
  ) {
    return this.agroRangoFacturaService.updateEmpleado(
      id,
      empleado,
      updateRangoFacturaDto,
    );
  }

  @Patch(':id/anular-sobrantes')
  anularSobrantes(@Param('id') id: string) {
    return this.agroRangoFacturaService.anularFacturasNoUsadas(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroRangoFacturaService.remove(id);
  }
}
