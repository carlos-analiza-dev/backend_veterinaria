import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CompraAgroInsumosService } from './compra-agro-insumo.service';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { CreateCompraAgroInsumoDto } from './dto/create-compra-agro-insumo.dto';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('compra-agro-insumos')
export class CompraAgroInsumosController {
  constructor(
    private readonly compraInsumosService: CompraAgroInsumosService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createCompraInsumoDto: CreateCompraAgroInsumoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.compraInsumosService.create(createCompraInsumoDto, cliente);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @Body() createCompraInsumoDto: CreateCompraAgroInsumoDto,
    @GetEmpleado() empleado: EmpleadosAgro,
  ) {
    return this.compraInsumosService.createEmpleado(
      createCompraInsumoDto,
      empleado,
    );
  }

  @Get('compra/:propietarioId')
  findAll(
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.compraInsumosService.findAll(propietarioId, paginationDto);
  }
}
