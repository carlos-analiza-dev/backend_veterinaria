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
import { AgroSucursalesService } from './agro-sucursales.service';
import { CreateAgroSucursaleDto } from './dto/create-agro-sucursale.dto';
import { UpdateAgroSucursaleDto } from './dto/update-agro-sucursale.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('agro-sucursales')
export class AgroSucursalesController {
  constructor(private readonly agroSucursalesService: AgroSucursalesService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createAgroSucursaleDto: CreateAgroSucursaleDto,
  ) {
    return this.agroSucursalesService.create(cliente, createAgroSucursaleDto);
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroSucursalesService.findAll(cliente, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroSucursalesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgroSucursaleDto: UpdateAgroSucursaleDto,
  ) {
    return this.agroSucursalesService.update(id, updateAgroSucursaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroSucursalesService.remove(id);
  }
}
