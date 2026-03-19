import { Injectable } from '@nestjs/common';
import { CreateDetallesServicioReproductivoDto } from './dto/create-detalles_servicio_reproductivo.dto';
import { UpdateDetallesServicioReproductivoDto } from './dto/update-detalles_servicio_reproductivo.dto';

@Injectable()
export class DetallesServicioReproductivoService {
  create(createDetallesServicioReproductivoDto: CreateDetallesServicioReproductivoDto) {
    return 'This action adds a new detallesServicioReproductivo';
  }

  findAll() {
    return `This action returns all detallesServicioReproductivo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detallesServicioReproductivo`;
  }

  update(id: number, updateDetallesServicioReproductivoDto: UpdateDetallesServicioReproductivoDto) {
    return `This action updates a #${id} detallesServicioReproductivo`;
  }

  remove(id: number) {
    return `This action removes a #${id} detallesServicioReproductivo`;
  }
}
