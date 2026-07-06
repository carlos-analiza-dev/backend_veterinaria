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
import { SanidadAnimalService } from './sanidad_animal.service';
import { CreateSanidadAnimalDto } from './dto/create-sanidad_animal.dto';
import { UpdateSanidadAnimalDto } from './dto/update-sanidad_animal.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('sanidad-animal')
export class SanidadAnimalController {
  constructor(private readonly sanidadAnimalService: SanidadAnimalService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createSanidadAnimalDto: CreateSanidadAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.sanidadAnimalService.create(createSanidadAnimalDto, cliente);
  }

  @Get()
  @AuthCliente()
  findAll(
    @Query() paginationDto: PaginationDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.sanidadAnimalService.findAll(paginationDto, cliente);
  }

  @Get('animal/:animalId')
  findAllByAnimal(@Param('animalId', ParseUUIDPipe) animalId: string) {
    return this.sanidadAnimalService.findAllByAnimal(animalId);
  }

  @Get('estadisticas/:animalId')
  getEstadisticas(@Param('animalId', ParseUUIDPipe) animalId: string) {
    return this.sanidadAnimalService.getEstadisticasByAnimal(animalId);
  }

  @Get('tipo/:tipoServicio')
  findByTipoServicio(@Param('tipoServicio') tipoServicio: string) {
    return this.sanidadAnimalService.findByTipoServicio(tipoServicio);
  }

  @Get('eliminados')
  @AuthCliente()
  findAllEliminados(
    @Query() paginationDto: PaginationDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.sanidadAnimalService.findAllEliminados(paginationDto, cliente);
  }

  @Get('costos')
  @AuthCliente()
  getCostosMensuales(
    @Query() paginationDto: PaginationDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.sanidadAnimalService.getCostosMensuales(paginationDto, cliente);
  }

  @Get('rango-fechas')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.sanidadAnimalService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sanidadAnimalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSanidadAnimalDto: UpdateSanidadAnimalDto,
  ) {
    return this.sanidadAnimalService.update(id, updateSanidadAnimalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sanidadAnimalService.remove(id);
  }
}
