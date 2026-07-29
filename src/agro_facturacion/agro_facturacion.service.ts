import { Injectable } from '@nestjs/common';
import { CreateAgroFacturacionDto } from './dto/create-agro_facturacion.dto';
import { UpdateAgroFacturacionDto } from './dto/update-agro_facturacion.dto';

@Injectable()
export class AgroFacturacionService {
  create(createAgroFacturacionDto: CreateAgroFacturacionDto) {
    return 'This action adds a new agroFacturacion';
  }

  findAll() {
    return `This action returns all agroFacturacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agroFacturacion`;
  }

  update(id: number, updateAgroFacturacionDto: UpdateAgroFacturacionDto) {
    return `This action updates a #${id} agroFacturacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} agroFacturacion`;
  }
}
