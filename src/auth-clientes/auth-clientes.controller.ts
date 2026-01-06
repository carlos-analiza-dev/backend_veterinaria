import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthClientesService } from './auth-clientes.service';
import { CreateAuthClienteDto } from './dto/create-auth-cliente.dto';
import { UpdateAuthClienteDto } from './dto/update-auth-cliente.dto';
import { AuthCliente } from './decorators/auth-cliente.decorator';
import { GetCliente } from './decorators/get-cliente.decorator';
import { Cliente } from './entities/auth-cliente.entity';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { UpdatePasswordDto } from './dto/update-password-cliente.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { VerifiedAccountDto } from 'src/auth/dto/verify-account';

@Controller('auth-clientes')
export class AuthClientesController {
  constructor(private readonly authClientesService: AuthClientesService) {}

  @Post('register')
  createUser(@Body() createClienteDto: CreateAuthClienteDto) {
    return this.authClientesService.create(createClienteDto);
  }

  @Post('login')
  loginUser(@Body() loginClienteDto: LoginClienteDto) {
    return this.authClientesService.login(loginClienteDto);
  }

  @Post('change-password')
  actualizarContrasena(@Body() updatePassword: UpdatePasswordDto) {
    return this.authClientesService.actualizarContrasena(updatePassword);
  }

  @Post('verify-account')
  verificarCuenta(@Body() verifiedAccount: VerifiedAccountDto) {
    return this.authClientesService.verificarCuenta(verifiedAccount);
  }

  @AuthCliente()
  checkAuthStatus(@GetCliente() cliente: Cliente) {
    return this.authClientesService.checkAuthStatus(cliente);
  }

  @Get()
  @Auth()
  getClientesAdmin(@GetUser() user: User) {
    return this.authClientesService.getClientesAdmin(user);
  }

  @Get('clientes')
  @Auth()
  getUsers(@Query() paginationDto: PaginationDto) {
    return this.authClientesService.getClientes(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authClientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuthClienteDto: UpdateAuthClienteDto,
  ) {
    return this.authClientesService.update(id, updateAuthClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authClientesService.remove(+id);
  }
}
