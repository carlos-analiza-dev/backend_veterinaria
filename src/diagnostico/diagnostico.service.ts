import { Injectable } from '@nestjs/common';
import { CreateDiagnosticoDto } from './dto/create-diagnostico.dto';
import { UpdateDiagnosticoDto } from './dto/update-diagnostico.dto';

@Injectable()
export class DiagnosticoService {
  create(createDiagnosticoDto: CreateDiagnosticoDto) {
    return 'This action adds a new diagnostico';
  }

  findAll() {
    return `This action returns all diagnostico`;
  }

  findOne(id: number) {
    return `This action returns a #${id} diagnostico`;
  }

  update(id: number, updateDiagnosticoDto: UpdateDiagnosticoDto) {
    return `This action updates a #${id} diagnostico`;
  }

  remove(id: number) {
    return `This action removes a #${id} diagnostico`;
  }
}
