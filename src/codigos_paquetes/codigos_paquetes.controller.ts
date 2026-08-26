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
import { CodigosPaquetesService } from './codigos_paquetes.service';
import { CreateCodigosPaqueteDto } from './dto/create-codigos_paquete.dto';
import { UpdateCodigosPaqueteDto } from './dto/update-codigos_paquete.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AsignarPaqueteCodigoDto } from './dto/asignar-paquete.dto';

@Controller('codigos-paquetes')
export class CodigosPaquetesController {
  constructor(
    private readonly codigosPaquetesService: CodigosPaquetesService,
  ) {}

  @Post()
  @Auth()
  create(@Body() createCodigosPaqueteDto: CreateCodigosPaqueteDto) {
    return this.codigosPaquetesService.create(createCodigosPaqueteDto);
  }

  @Post('asignar')
  @AuthCliente()
  asignarPaquetePorCodigo(
    @GetCliente() cliente: Cliente,
    @Body()
    asignarPaqueteCodigoDto: AsignarPaqueteCodigoDto,
  ) {
    return this.codigosPaquetesService.asignarPaquetePorCodigo(
      cliente,
      asignarPaqueteCodigoDto,
    );
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.codigosPaquetesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codigosPaquetesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCodigosPaqueteDto: UpdateCodigosPaqueteDto,
  ) {
    return this.codigosPaquetesService.update(id, updateCodigosPaqueteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.codigosPaquetesService.remove(id);
  }
}
