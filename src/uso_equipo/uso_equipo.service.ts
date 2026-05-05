import { Injectable } from '@nestjs/common';
import { CreateUsoEquipoDto } from './dto/create-uso_equipo.dto';
import { UpdateUsoEquipoDto } from './dto/update-uso_equipo.dto';

@Injectable()
export class UsoEquipoService {
  create(createUsoEquipoDto: CreateUsoEquipoDto) {
    return 'This action adds a new usoEquipo';
  }

  findAll() {
    return `This action returns all usoEquipo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usoEquipo`;
  }

  update(id: number, updateUsoEquipoDto: UpdateUsoEquipoDto) {
    return `This action updates a #${id} usoEquipo`;
  }

  remove(id: number) {
    return `This action removes a #${id} usoEquipo`;
  }
}
