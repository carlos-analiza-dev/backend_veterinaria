import { Injectable } from '@nestjs/common';
import { CreateAgroSucursaleDto } from './dto/create-agro-sucursale.dto';
import { UpdateAgroSucursaleDto } from './dto/update-agro-sucursale.dto';

@Injectable()
export class AgroSucursalesService {
  create(createAgroSucursaleDto: CreateAgroSucursaleDto) {
    return 'This action adds a new agroSucursale';
  }

  findAll() {
    return `This action returns all agroSucursales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agroSucursale`;
  }

  update(id: number, updateAgroSucursaleDto: UpdateAgroSucursaleDto) {
    return `This action updates a #${id} agroSucursale`;
  }

  remove(id: number) {
    return `This action removes a #${id} agroSucursale`;
  }
}
