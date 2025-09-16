import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cliente } from '../entities/auth-cliente.entity';

@Injectable()
export class ClienteAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const cliente = req.user as Cliente;

    if (!cliente) {
      throw new UnauthorizedException('Cliente no autenticado');
    }

    if (!cliente.isActive) {
      throw new BadRequestException('Cliente inactivo');
    }

    return true;
  }
}
