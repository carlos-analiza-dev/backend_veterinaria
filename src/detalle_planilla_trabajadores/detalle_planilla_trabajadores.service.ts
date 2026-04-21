import { Injectable } from '@nestjs/common';
import { CreateDetallePlanillaTrabajadoreDto } from './dto/create-detalle_planilla_trabajadore.dto';
import { UpdateDetallePlanillaTrabajadoreDto } from './dto/update-detalle_planilla_trabajadore.dto';

@Injectable()
export class DetallePlanillaTrabajadoresService {
  create(createDetallePlanillaTrabajadoreDto: CreateDetallePlanillaTrabajadoreDto) {
    return 'This action adds a new detallePlanillaTrabajadore';
  }

  findAll() {
    return `This action returns all detallePlanillaTrabajadores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detallePlanillaTrabajadore`;
  }

  update(id: number, updateDetallePlanillaTrabajadoreDto: UpdateDetallePlanillaTrabajadoreDto) {
    return `This action updates a #${id} detallePlanillaTrabajadore`;
  }

  remove(id: number) {
    return `This action removes a #${id} detallePlanillaTrabajadore`;
  }
}
