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
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('animal-finca')
export class AnimalFincaController {
  constructor(private readonly animalFincaService: AnimalFincaService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createAnimalFincaDto: CreateAnimalFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.create(createAnimalFincaDto, cliente);
  }

  @Get('/propietario-animales/:propietarioId')
  @AuthCliente()
  findAllAnimales(
    @GetCliente() cliente: Cliente,
    @Param('propietarioId') propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.animalFincaService.findAll(
      cliente,
      propietarioId,
      paginationDto,
    );
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
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdateAnimalFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.update(id, updateAnimalFincaDto, cliente);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.animalFincaService.remove(+id);
  }
}
