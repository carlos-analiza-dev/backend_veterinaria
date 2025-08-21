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

@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @Post()
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
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

  @Get('usuario/:id')
  findAllByUser(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.citasService.findAllByUser(id, paginationDto);
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
  update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto) {
    return this.citasService.update(id, updateCitaDto);
  }

  /* @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citasService.remove(+id);
  } */
}
