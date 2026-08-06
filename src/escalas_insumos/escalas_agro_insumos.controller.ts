import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EscalasAgroInsumosService } from './escalas_agro_insumos.service';
import { CreateEscalasAgroInsumoDto } from './dto/create-escalas_agro_insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { UpdateEscalasAgroInsumoDto } from './dto/update-escalas_insumo.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Controller('escalas-agro-insumos')
export class EscalasAgroInsumosController {
  constructor(
    private readonly escalasInsumosService: EscalasAgroInsumosService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createEscalasInsumoDto: CreateEscalasAgroInsumoDto,
  ) {
    return this.escalasInsumosService.create(cliente, createEscalasInsumoDto);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createEscalasInsumoDto: CreateEscalasAgroInsumoDto,
  ) {
    return this.escalasInsumosService.createEmpleado(
      empleado,
      createEscalasInsumoDto,
    );
  }

  @Get()
  findAll() {
    return this.escalasInsumosService.findAll();
  }

  @Get('insumo/:insumoId')
  findByinsumo(
    @Query() paginationDto: PaginationDto,
    @Param('insumoId') insumoId: string,
  ) {
    return this.escalasInsumosService.findByInsumo(paginationDto, insumoId);
  }

  @Get('insumo-escalas/:insumoId')
  findByinsumoEscalas(@Param('insumoId') insumoId: string) {
    return this.escalasInsumosService.findByInsumoEscalas(insumoId);
  }

  @Get('proveedor/:proveedorId/insumo/:insumoId')
  findByProveedorAndinsumo(
    @Param('proveedorId') proveedorId: string,
    @Param('insumoId') insumoId: string,
  ) {
    return this.escalasInsumosService.findByProveedorAndInsumo(
      proveedorId,
      insumoId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEscalasInsumoDto: UpdateEscalasAgroInsumoDto,
  ) {
    return this.escalasInsumosService.update(id, updateEscalasInsumoDto);
  }

  @Patch('empleado/:id')
  updateEmpleado(
    @Param('id') id: string,
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() updateEscalasInsumoDto: UpdateEscalasAgroInsumoDto,
  ) {
    return this.escalasInsumosService.updateEmpleado(
      id,
      empleado,
      updateEscalasInsumoDto,
    );
  }
}
