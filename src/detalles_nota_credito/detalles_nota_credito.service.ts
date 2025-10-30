import { Injectable } from '@nestjs/common';
import { CreateDetallesNotaCreditoDto } from './dto/create-detalles_nota_credito.dto';
import { UpdateDetallesNotaCreditoDto } from './dto/update-detalles_nota_credito.dto';

@Injectable()
export class DetallesNotaCreditoService {
  create(createDetallesNotaCreditoDto: CreateDetallesNotaCreditoDto) {
    return 'This action adds a new detallesNotaCredito';
  }

  findAll() {
    return `This action returns all detallesNotaCredito`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detallesNotaCredito`;
  }

  update(id: number, updateDetallesNotaCreditoDto: UpdateDetallesNotaCreditoDto) {
    return `This action updates a #${id} detallesNotaCredito`;
  }

  remove(id: number) {
    return `This action removes a #${id} detallesNotaCredito`;
  }
}
