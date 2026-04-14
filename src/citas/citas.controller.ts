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
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @AuthCliente()
  create(@Body() createCitaDto: CreateCitaDto, @GetCliente() cliente: Cliente) {
    return this.citasService.create(createCitaDto, cliente);
  }

  @Get('horarios/disponibles')
  getHorariosDisponibles(
    @Query('medicoId') medicoId: string,
    @Query('fecha') fecha: string,
    @Query('duracionServicioHoras') duracionServicioHoras: string,
  ) {
    return this.citasService.getHorariosDisponibles(
      medicoId,
      fecha,
      +duracionServicioHoras,
    );
  }

  @Get('usuario')
  @AuthCliente()
  findAllByUser(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.citasService.findAllByUser(cliente, paginationDto);
  }

  @Get('animales/:id')
  findAllAnimalesCita(@Param('id') id: string) {
    return this.citasService.findAllAnimalesCita(id);
  }

  @Get('medico/:id')
  findAllByMedico(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.citasService.findPendienteCitasByUser(id, paginationDto);
  }

  @Get('medico/confirmada/:id')
  findAllByMedicoCitaConfirm(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.citasService.findConfirmedCitasByUser(id, paginationDto);
  }

  @Get('completadas/:id')
  findAllByMedicoCitaCompletedNotPagination(@Param('id') id: string) {
    return this.citasService.findAllByMedicoCitaCompletedNotPagination(id);
  }

  @Get('medico/completadas/:id')
  findAllByMedicoCitaCompleted(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.citasService.findAllByMedicoCitaCompleted(id, paginationDto);
  }

  /*  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(+id);
  }
 */
  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateCitaDto: UpdateCitaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.citasService.update(id, updateCitaDto, cliente);
  }

  /* @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citasService.remove(+id);
  } */
}
