import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { MovimientosAgroLoteService } from './movimientos_agro_lotes.service';

@Controller('movimientos-agro-lote')
export class MovimientosAgroLoteController {
  constructor(
    private readonly movimientosLoteService: MovimientosAgroLoteService,
  ) {}

  @Get('agroservicio/:propietarioId')
  findAll(
    @Param('propietarioId') propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.movimientosLoteService.findAll(propietarioId, paginationDto);
  }
}
