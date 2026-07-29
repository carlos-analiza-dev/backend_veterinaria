import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AgroImpuestosService } from './agro_impuestos.service';
import { CreateAgroImpuestoDto } from './dto/create-agro_impuesto.dto';
import { UpdateAgroImpuestoDto } from './dto/update-agro_impuesto.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Controller('agro-impuestos')
export class AgroImpuestosController {
  constructor(private readonly agroImpuestosService: AgroImpuestosService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createTaxesPaiDto: CreateAgroImpuestoDto,
  ) {
    return this.agroImpuestosService.create(cliente, createTaxesPaiDto);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createTaxesPaiDto: CreateAgroImpuestoDto,
  ) {
    return this.agroImpuestosService.createEmpleado(
      empleado,
      createTaxesPaiDto,
    );
  }

  @Get('agroservicio/:propietarioId')
  findAllPais(@Param('propietarioId') propietarioId: string) {
    return this.agroImpuestosService.findAllPais(propietarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroImpuestosService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @GetCliente() cliente: Cliente,
    @Body() updateTaxesPaiDto: UpdateAgroImpuestoDto,
  ) {
    return this.agroImpuestosService.update(id, cliente, updateTaxesPaiDto);
  }

  @Patch('empleado/:id')
  @AuthEmpleado()
  updateEmpleado(
    @Param('id') id: string,
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() updateTaxesPaiDto: UpdateAgroImpuestoDto,
  ) {
    return this.agroImpuestosService.updateEmpleado(
      id,
      empleado,
      updateTaxesPaiDto,
    );
  }
}
