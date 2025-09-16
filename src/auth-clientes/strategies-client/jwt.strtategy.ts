import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { Cliente } from '../entities/auth-cliente.entity';

@Injectable()
export class JwtClienteStrategy extends PassportStrategy(
  Strategy,
  'jwt-cliente',
) {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<Cliente> {
    const { id } = payload;

    const cliente = await this.clienteRepository.findOne({
      where: { id },
    });

    if (!cliente) {
      throw new UnauthorizedException('Token inválido');
    }

    if (!cliente.isActive) {
      throw new UnauthorizedException(
        'El cliente está inactivo, contacte al administrador',
      );
    }

    return cliente;
  }
}
