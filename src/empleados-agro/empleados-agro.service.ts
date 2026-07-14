import { Injectable } from '@nestjs/common';
import { CreateEmpleadosAgroDto } from './dto/create-empleados-agro.dto';
import { UpdateEmpleadosAgroDto } from './dto/update-empleados-agro.dto';

@Injectable()
export class EmpleadosAgroService {
  create(createEmpleadosAgroDto: CreateEmpleadosAgroDto) {
    return 'This action adds a new empleadosAgro';
  }

  findAll() {
    return `This action returns all empleadosAgro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} empleadosAgro`;
  }

  update(id: number, updateEmpleadosAgroDto: UpdateEmpleadosAgroDto) {
    return `This action updates a #${id} empleadosAgro`;
  }

  remove(id: number) {
    return `This action removes a #${id} empleadosAgro`;
  }
}
