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
import { AnimalFincaService } from './animal_finca.service';
import { CreateAnimalFincaDto } from './dto/create-animal_finca.dto';
import { UpdateAnimalFincaDto } from './dto/update-animal_finca.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { UpdateDeathStatusDto } from './dto/update-death-status.dto';

@Controller('animal-finca')
export class AnimalFincaController {
  constructor(private readonly animalFincaService: AnimalFincaService) {}

  @Post()
  create(@Body() createAnimalFincaDto: CreateAnimalFincaDto) {
    return this.animalFincaService.create(createAnimalFincaDto);
  }

  @Get('/propietario-animales/:propietarioId')
  findAllAnimales(
    @Param('propietarioId') propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.animalFincaService.findAll(propietarioId, paginationDto);
  }

  @Get('/animales/:fincaId/:especieId/:razaId')
  findAllAnimalesByFincaRaza(
    @Param('fincaId') fincaId: string,
    @Param('especieId') especieId: string,
    @Param('razaId') razaId: string,
  ) {
    return this.animalFincaService.findAllAnimalesByFincaRaza(
      fincaId,
      especieId,
      razaId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.animalFincaService.findOne(id);
  }
  @Patch(':id/death-status')
  async updateDeathStatus(
    @Param('id') id: string,
    @Body() updateDeathStatusDto: UpdateDeathStatusDto,
  ) {
    const updatedAnimal = await this.animalFincaService.updateDeathStatus(
      id,
      updateDeathStatusDto,
    );
    return {
      message: 'Estado de muerte actualizado correctamente',
      data: updatedAnimal,
    };
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdateAnimalFincaDto,
  ) {
    return this.animalFincaService.update(id, updateAnimalFincaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.animalFincaService.remove(+id);
  }
}
