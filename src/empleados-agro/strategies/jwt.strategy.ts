import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { EmpleadosAgro } from '../entities/empleados-agro.entity';

@Injectable()
export class JwtEmpleadoStrategy extends PassportStrategy(
  Strategy,
  'jwt-empleado',
) {
  constructor(
    @InjectRepository(EmpleadosAgro)
    private readonly clienteRepository: Repository<EmpleadosAgro>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<EmpleadosAgro> {
    const { id } = payload;

    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['role', 'sucursal'],
    });

    if (!cliente) {
      throw new UnauthorizedException('Token inválido');
    }

    if (!cliente.isActive) {
      throw new UnauthorizedException(
        'El empleado está inactivo, contacte al administrador',
      );
    }

    return cliente;
  }
}
