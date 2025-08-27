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
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/auth.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('change-password')
  actualizarContrasena(@Body() updatePassword: UpdatePasswordDto) {
    return this.authService.actualizarContrasena(updatePassword);
  }

  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('users')
  @Auth()
  getUsers(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.authService.getUsers(user, paginationDto);
  }

  @Get('veterinarios')
  @Auth()
  getVeterinarios(@GetUser() user: User) {
    return this.authService.getVeterinariosNoAsignados(user);
  }

  @Get('user/:userId')
  @Auth()
  getUserById(@Param('userId') userId: string) {
    return this.authService.getUserById(userId);
  }

  @Patch('user-update/:userId')
  @Auth(ValidRoles.Administrador)
  actualizarUsuario(
    @Param('userId') userId: string,
    @Body() updateUsuarioDto: UpdateUserDto,
  ) {
    return this.authService.actualizarUsuario(userId, updateUsuarioDto);
  }
}
