import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AlimentacionAnimalService } from './alimentacion_animal.service';
import { CreateAlimentacionAnimalDto } from './dto/create-alimentacion_animal.dto';
import { UpdateAlimentacionAnimalDto } from './dto/update-alimentacion_animal.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('alimentacion-animal')
export class AlimentacionAnimalController {
  constructor(
    private readonly alimentacionAnimalService: AlimentacionAnimalService,
  ) {}

  @Post()
  create(@Body() createAlimentacionAnimalDto: CreateAlimentacionAnimalDto) {
    return this.alimentacionAnimalService.create(createAlimentacionAnimalDto);
  }

  @Get()
  @AuthCliente()
  findAll(@GetCliente() cliente: Cliente) {
    return this.alimentacionAnimalService.findAll(cliente);
  }

  @Get('animal/:id')
  findByAnimal(@Param() animalId: string) {
    return this.alimentacionAnimalService.findByAnimal(animalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alimentacionAnimalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlimentacionAnimalDto: UpdateAlimentacionAnimalDto,
  ) {
    return this.alimentacionAnimalService.update(
      id,
      updateAlimentacionAnimalDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alimentacionAnimalService.remove(id);
  }
}
