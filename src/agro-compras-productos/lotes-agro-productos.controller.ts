import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LotesAgroProductosService } from './lotes-agro-productos.service';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { TransferirProductoDto } from 'src/lotes/dto/transferir-producto.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('agro-lotes-productos')
export class AgroProductosController {
  constructor(private readonly lotesService: LotesAgroProductosService) {}

  @Post('transferir')
  @AuthCliente()
  async transferirProducto(
    @Body() transferirProductoDto: TransferirProductoDto,
  ) {
    return await this.lotesService.transferirProducto(transferirProductoDto);
  }

  @Post('transferir/empleado')
  @AuthEmpleado()
  async transferirProductoEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() transferirProductoDto: TransferirProductoDto,
  ) {
    return await this.lotesService.transferirProductoEmpleado(
      empleado,
      transferirProductoDto,
    );
  }

  @Get('auditoria')
  @AuthCliente()
  findAuditoria(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.lotesService.findAuditoria(cliente, paginationDto);
  }

  @Get('producto/:id_producto')
  findByProducto(@Param('id_producto', ParseUUIDPipe) id_producto: string) {
    return this.lotesService.findByProducto(id_producto);
  }

  @Get('sucursal/:id_sucursal/:propietarioId')
  findBySucursal(
    @Param('id_sucursal', ParseUUIDPipe) id_sucursal: string,
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.lotesService.findBySucursal(
      id_sucursal,
      propietarioId,
      paginationDto,
    );
  }

  @Get('existencias/:propietarioId')
  getExistenciasByProducto(
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.lotesService.getExistenciasByProducto(
      propietarioId,
      paginationDto,
    );
  }

  @Get('existencia/producto/:id_producto/sucursal/:id_sucursal')
  getExistenciaPorProductoSucursal(
    @Param('id_producto', ParseUUIDPipe) id_producto: string,
    @Param('id_sucursal', ParseUUIDPipe) id_sucursal: string,
  ) {
    return this.lotesService.getExistenciaPorProductoSucursal(
      id_producto,
      id_sucursal,
    );
  }
}
