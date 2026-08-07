import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ConsumoAgroInsumosService } from './consumo_agro_insumos.service';
import { CreateConsumoAgroInsumoDto } from './dto/create-consumo_agro_insumo.dto';
import { UpdateConsumoAgroInsumoDto } from './dto/update-consumo_agro_insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';

@Controller('consumo-agro-insumos')
export class ConsumoAgroInsumosController {
  constructor(
    private readonly consumoAgroInsumosService: ConsumoAgroInsumosService,
  ) {}

  @Post(':sucursalId/:insumoId')
  @AuthCliente()
  async consumirInsumo(
    @Param('sucursalId', ParseUUIDPipe) sucursalId: string,
    @Param('insumoId', ParseUUIDPipe) insumoId: string,
    @Body() createConsumoDto: CreateConsumoAgroInsumoDto,
  ) {
    return this.consumoAgroInsumosService.consumirInsumo(
      sucursalId,
      insumoId,
      createConsumoDto,
    );
  }

  @Post('empleado/:sucursalId/:insumoId')
  @AuthEmpleado()
  async consumirInsumoEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Param('sucursalId', ParseUUIDPipe) sucursalId: string,
    @Param('insumoId', ParseUUIDPipe) insumoId: string,
    @Body() createConsumoDto: CreateConsumoAgroInsumoDto,
  ) {
    return this.consumoAgroInsumosService.consumirInsumoEmpleado(
      empleado,
      sucursalId,
      insumoId,
      createConsumoDto,
    );
  }

  @Get('consumo/:propieptarioId')
  findAll(
    @Param('propieptarioId', ParseUUIDPipe) propieptarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.consumoAgroInsumosService.findAll(
      propieptarioId,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumoAgroInsumosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsumoAgroInsumoDto: UpdateConsumoAgroInsumoDto,
  ) {
    return this.consumoAgroInsumosService.update(
      +id,
      updateConsumoAgroInsumoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumoAgroInsumosService.remove(+id);
  }
}
