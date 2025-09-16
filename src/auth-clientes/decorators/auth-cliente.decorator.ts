import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function AuthCliente() {
  return applyDecorators(UseGuards(AuthGuard('jwt-cliente')));
}
