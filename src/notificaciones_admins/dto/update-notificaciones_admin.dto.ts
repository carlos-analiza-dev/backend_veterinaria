import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificacionesAdminDto } from './create-notificaciones_admin.dto';

export class UpdateNotificacionesAdminDto extends PartialType(CreateNotificacionesAdminDto) {}
