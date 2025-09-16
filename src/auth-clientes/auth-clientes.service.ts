import { Injectable } from '@nestjs/common';
import { CreateAuthClienteDto } from './dto/create-auth-cliente.dto';
import { UpdateAuthClienteDto } from './dto/update-auth-cliente.dto';

@Injectable()
export class AuthClientesService {
  create(createAuthClienteDto: CreateAuthClienteDto) {
    return 'This action adds a new authCliente';
  }

  findAll() {
    return `This action returns all authClientes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authCliente`;
  }

  update(id: number, updateAuthClienteDto: UpdateAuthClienteDto) {
    return `This action updates a #${id} authCliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} authCliente`;
  }
}
