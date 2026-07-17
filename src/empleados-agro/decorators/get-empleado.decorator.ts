import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetEmpleado = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const cliente = req.user;

    if (!cliente)
      throw new InternalServerErrorException('Empleado no viene en la request');

    return cliente;
  },
);
