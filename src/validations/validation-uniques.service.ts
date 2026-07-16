import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ValidationService {
  constructor(
    @InjectRepository(EmpleadosAgro)
    private readonly empleadoRepo: Repository<EmpleadosAgro>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validarIdentificacion(identificacion: string): Promise<void> {
    const [cliente, usuario, empleado] = await Promise.all([
      this.clienteRepo.findOne({
        where: { identificacion },
        select: ['id'],
      }),
      this.userRepo.findOne({
        where: { identificacion },
        select: ['id'],
      }),
      this.empleadoRepo.findOne({
        where: { identificacion },
        select: ['id'],
      }),
    ]);

    if (cliente || usuario || empleado) {
      throw new BadRequestException(
        'La identificación ingresada ya se encuentra registrada.',
      );
    }
  }

  async validarEmail(email: string): Promise<void> {
    const [cliente, usuario, empleado] = await Promise.all([
      this.clienteRepo.findOne({
        where: { email },
        select: ['id'],
      }),
      this.userRepo.findOne({
        where: { email },
        select: ['id'],
      }),
      this.empleadoRepo.findOne({
        where: { email },
        select: ['id'],
      }),
    ]);

    if (cliente || usuario || empleado) {
      throw new BadRequestException(
        'El correo electrónico ingresado ya se encuentra registrado.',
      );
    }
  }

  async validarTelefono(telefono: string): Promise<void> {
    const [cliente, usuario, empleado] = await Promise.all([
      this.clienteRepo.findOne({
        where: { telefono },
        select: ['id'],
      }),
      this.userRepo.findOne({
        where: { telefono },
        select: ['id'],
      }),
      this.empleadoRepo.findOne({
        where: { telefono },
        select: ['id'],
      }),
    ]);

    if (cliente || usuario || empleado) {
      throw new BadRequestException(
        'El teléfono ingresado ya se encuentra registrado.',
      );
    }
  }
}
