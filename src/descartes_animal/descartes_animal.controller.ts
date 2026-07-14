import { Controller, Get, Query } from '@nestjs/common';
import { DescartesAnimalService } from './descartes_animal.service';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('descartes-animal')
export class DescartesAnimalController {
  constructor(
    private readonly descartesAnimalService: DescartesAnimalService,
  ) {}
  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.descartesAnimalService.obtenerDescartesPorMesYEspecie(
      cliente,
      paginationDto,
    );
  }
}
