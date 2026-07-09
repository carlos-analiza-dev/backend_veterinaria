import { Controller, Get, Query } from '@nestjs/common';
import { DescartesAnimalService } from './descartes_animal.service';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('descartes-animal')
export class DescartesAnimalController {
  constructor(
    private readonly descartesAnimalService: DescartesAnimalService,
  ) {}
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.descartesAnimalService.obtenerDescartesPorMesYEspecie(
      paginationDto,
    );
  }
}
