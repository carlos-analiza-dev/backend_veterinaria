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
import { PlanillaTrabajadoresService } from './planilla_trabajadores.service';
import { UpdatePlanillaTrabajadoreDto } from './dto/update-planilla_trabajadore.dto';
import { CrearPlanillaTrabajadoresDto } from './dto/create-planilla_trabajadore.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { RegistrarPagosDto } from './dto/registrar-pagos.dto';
import { AnularPlanillaDto } from './dto/anular-planilla.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('planilla-trabajadores')
@AuthCliente()
export class PlanillaTrabajadoresController {
  constructor(
    private readonly planillaTrabajadoresService: PlanillaTrabajadoresService,
  ) {}

  @Post()
  create(
    @GetCliente() propietario: Cliente,
    @Body() createPlanillaTrabajadoreDto: CrearPlanillaTrabajadoresDto,
  ) {
    return this.planillaTrabajadoresService.create(
      propietario,
      createPlanillaTrabajadoreDto,
    );
  }

  @Get()
  findAll(
    @GetCliente() propietario: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.planillaTrabajadoresService.findAll(propietario, paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
  ) {
    return this.planillaTrabajadoresService.findOne(id, propietario.id);
  }

  @Get(':id/detalle')
  obtenerDetalle(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
  ) {
    return this.planillaTrabajadoresService.obtenerDetallePlanilla(
      id,
      propietario.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
    @Body() updatePlanillaTrabajadoreDto: UpdatePlanillaTrabajadoreDto,
  ) {
    return this.planillaTrabajadoresService.update(
      id,
      propietario.id,
      updatePlanillaTrabajadoreDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
  ) {
    return this.planillaTrabajadoresService.remove(id, propietario.id);
  }

  @Post(':id/generar')
  generarPlanilla(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
  ) {
    return this.planillaTrabajadoresService.generarPlanillaDesdeJornadas(
      id,
      propietario.id,
    );
  }

  @Post(':id/confirmar')
  confirmarPlanilla(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
  ) {
    return this.planillaTrabajadoresService.confirmarPlanilla(
      id,
      propietario.id,
    );
  }

  @Post(':id/pagos')
  registrarPagos(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
    @Body() registrarPagosDto: RegistrarPagosDto,
  ) {
    return this.planillaTrabajadoresService.registrarPagos(
      id,
      propietario.id,
      registrarPagosDto.pagos,
    );
  }

  @Post(':id/anular')
  anularPlanilla(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCliente() propietario: Cliente,
    @Body() anularPlanillaDto: AnularPlanillaDto,
  ) {
    return this.planillaTrabajadoresService.anularPlanilla(
      id,
      propietario.id,
      anularPlanillaDto.motivo,
    );
  }
}
