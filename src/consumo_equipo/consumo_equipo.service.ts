import { Injectable } from '@nestjs/common';
import { CreateConsumoEquipoDto } from './dto/create-consumo_equipo.dto';
import { UpdateConsumoEquipoDto } from './dto/update-consumo_equipo.dto';

@Injectable()
export class ConsumoEquipoService {
  create(createConsumoEquipoDto: CreateConsumoEquipoDto) {
    return 'This action adds a new consumoEquipo';
  }

  findAll() {
    return `This action returns all consumoEquipo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} consumoEquipo`;
  }

  update(id: number, updateConsumoEquipoDto: UpdateConsumoEquipoDto) {
    return `This action updates a #${id} consumoEquipo`;
  }

  remove(id: number) {
    return `This action removes a #${id} consumoEquipo`;
  }
}
