import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
} from '@nestjs/common';
import { NotificacionesAdminsService } from './notificaciones_admins.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';
import { CreateNotificacionesAdminDto } from './dto/create-notificaciones_admin.dto';

@Controller('notificaciones-admins')
export class NotificacionesAdminsController {
  constructor(
    private readonly notificacionesAdminsService: NotificacionesAdminsService,
  ) {}

  @Post()
  create(@Body() createNotification: CreateNotificacionesAdminDto) {
    return this.notificacionesAdminsService.create(createNotification);
  }

  @Get()
  @Auth(ValidRoles.Administrador)
  findAllNoRead(@GetUser() user: User) {
    return this.notificacionesAdminsService.findAllNoRead(user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.notificacionesAdminsService.findOne(+id);
  }

  @Patch(':id')
  receivedNotification(@Param('id') id: string) {
    return this.notificacionesAdminsService.receivedNotification(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificacionesAdminsService.remove(+id);
  }
}
