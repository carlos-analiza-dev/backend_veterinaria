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
import { CelosAnimalService } from './celos_animal.service';
import { CreateCelosAnimalDto } from './dto/create-celos_animal.dto';
import { UpdateCelosAnimalDto } from './dto/update-celos_animal.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('celos-animal')
export class CelosAnimalController {
  constructor(private readonly celosAnimalService: CelosAnimalService) {}

  @Post()
  @AuthCliente()
  create(@Body() createCelosAnimalDto: CreateCelosAnimalDto) {
    return this.celosAnimalService.create(createCelosAnimalDto);
  }

  @Get()
  @AuthCliente()
  findAll(
    @Query() paginationDto: PaginationDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.celosAnimalService.findAll(paginationDto, cliente);
  }

  @Get('activos')
  @AuthCliente()
  getActivos(@Query('fincaId') fincaId?: string) {
    return this.celosAnimalService.getAnimalesEnCeloActivo(fincaId);
  }

  @Get('proximo-celo/:fincaId')
  @AuthCliente()
  getAlertasProximosCelos(@Param('fincaId', ParseUUIDPipe) fincaId: string) {
    return this.celosAnimalService.getAlertasProximosCelos(fincaId);
  }

  @Get('estadisticas/:fincaId')
  @AuthCliente()
  getEstadisticas(
    @Param('fincaId', ParseUUIDPipe) fincaId: string,
    @Query('periodo') periodo?: 'semana' | 'mes' | 'año',
  ) {
    return this.celosAnimalService.getEstadisticasPorFinca(fincaId, periodo);
  }

  @Get('prediccion/:animalId')
  @AuthCliente()
  predecirCelo(@Param('animalId', ParseUUIDPipe) animalId: string) {
    return this.celosAnimalService.predecirProximoCelo(animalId);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.celosAnimalService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCelosAnimalDto: UpdateCelosAnimalDto,
  ) {
    return this.celosAnimalService.update(id, updateCelosAnimalDto);
  }

  @Patch(':id/finalizar')
  @AuthCliente()
  finalizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('fechaFin') fechaFin?: Date,
  ) {
    return this.celosAnimalService.finalizarCelo(id, fechaFin);
  }

  @Delete(':id')
  @AuthCliente()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.celosAnimalService.remove(id);
  }
}
