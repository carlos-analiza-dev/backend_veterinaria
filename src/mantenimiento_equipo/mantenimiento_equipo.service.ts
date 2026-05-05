import { Injectable } from '@nestjs/common';
import { CreateMantenimientoEquipoDto } from './dto/create-mantenimiento_equipo.dto';
import { UpdateMantenimientoEquipoDto } from './dto/update-mantenimiento_equipo.dto';

@Injectable()
export class MantenimientoEquipoService {
  create(createMantenimientoEquipoDto: CreateMantenimientoEquipoDto) {
    return 'This action adds a new mantenimientoEquipo';
  }

  findAll() {
    return `This action returns all mantenimientoEquipo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mantenimientoEquipo`;
  }

  update(id: number, updateMantenimientoEquipoDto: UpdateMantenimientoEquipoDto) {
    return `This action updates a #${id} mantenimientoEquipo`;
  }

  remove(id: number) {
    return `This action removes a #${id} mantenimientoEquipo`;
  }
}
