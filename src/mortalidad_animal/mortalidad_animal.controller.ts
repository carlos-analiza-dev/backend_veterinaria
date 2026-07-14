import { Controller, Get, Query } from '@nestjs/common';
import { MortalidadAnimalService } from './mortalidad_animal.service';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('mortalidad-animal')
export class MortalidadAnimalController {
  constructor(
    private readonly mortalidadAnimalService: MortalidadAnimalService,
  ) {}

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.mortalidadAnimalService.obtenerMortalidadPorMesYEspecie(
      cliente,
      paginationDto,
    );
  }
}
