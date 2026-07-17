import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function AuthEmpleado() {
  return applyDecorators(UseGuards(AuthGuard('jwt-empleado')));
}
