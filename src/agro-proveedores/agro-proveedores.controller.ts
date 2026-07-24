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
import { AgroProveedoresService } from './agro-proveedores.service';
import { CreateAgroProveedoreDto } from './dto/create-agro-proveedore.dto';
import { UpdateAgroProveedoreDto } from './dto/update-agro-proveedore.dto';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { SearchProveedorDto } from 'src/proveedores/dto/search-proveedor.dto';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('agro-proveedores')
export class AgroProveedoresController {
  constructor(
    private readonly agroProveedoresService: AgroProveedoresService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createProveedorDto: CreateAgroProveedoreDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.agroProveedoresService.create(createProveedorDto, cliente);
  }

  @Post('empleado')
  @AuthEmpleado()
  createAgroEmpleado(
    @Body() createProveedorDto: CreateAgroProveedoreDto,
    @GetEmpleado() empleado: EmpleadosAgro,
  ) {
    return this.agroProveedoresService.createAgroEmpleado(
      createProveedorDto,
      empleado,
    );
  }

  @Get('auditoria')
  @AuthCliente()
  findAuditoria(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroProveedoresService.findAuditoria(cliente, paginationDto);
  }

  @Get('agroservicio/:propietarioId')
  findAll(
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() searchProveedorDto: SearchProveedorDto,
  ) {
    return this.agroProveedoresService.findAll(
      propietarioId,
      searchProveedorDto,
    );
  }

  @Get('activos/:propietarioId')
  findAllActive(@Param('propietarioId', ParseUUIDPipe) propietarioId: string) {
    return this.agroProveedoresService.findAllActive(propietarioId);
  }

  @Get('pais/:paisId')
  findByPais(
    @Param('paisId', ParseUUIDPipe) paisId: string,
    @Query() searchProveedorDto: SearchProveedorDto,
  ) {
    return this.agroProveedoresService.findByPais(paisId, searchProveedorDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroProveedoresService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateAgroProveedoreDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.agroProveedoresService.update(id, updateProveedorDto, cliente);
  }

  @Patch('empleado/:id')
  @AuthEmpleado()
  updateEmpleado(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateAgroProveedoreDto,
    @GetEmpleado() empleado: EmpleadosAgro,
  ) {
    return this.agroProveedoresService.updateEmpleado(
      id,
      updateProveedorDto,
      empleado,
    );
  }
}
