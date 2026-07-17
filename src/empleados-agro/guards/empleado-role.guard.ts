import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EmpleadosAgro } from '../entities/empleados-agro.entity';

@Injectable()
export class EmpleadoRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const cliente = req.user as EmpleadosAgro;

    if (!cliente) {
      throw new UnauthorizedException('Empleado no autenticado');
    }

    if (!cliente.isActive) {
      throw new BadRequestException('Empleado inactivo');
    }

    return true;
  }
}
