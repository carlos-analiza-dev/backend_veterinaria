import { Controller, Get, Query } from '@nestjs/common';
import { MortalidadAnimalService } from './mortalidad_animal.service';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('mortalidad-animal')
export class MortalidadAnimalController {
  constructor(
    private readonly mortalidadAnimalService: MortalidadAnimalService,
  ) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.mortalidadAnimalService.obtenerMortalidadPorMesYEspecie(
      paginationDto,
    );
  }
}
