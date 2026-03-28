import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from 'src/interfaces/nptificaciones.type';

export class CreateNotificacionesAdminDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  read?: boolean;
}
