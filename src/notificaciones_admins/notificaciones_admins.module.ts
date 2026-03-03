import { Module } from '@nestjs/common';
import { NotificacionesAdminsService } from './notificaciones_admins.service';
import { NotificacionesAdminsController } from './notificaciones_admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesAdmin } from './entities/notificaciones_admin.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [NotificacionesAdminsController],
  imports: [TypeOrmModule.forFeature([NotificacionesAdmin, User]), AuthModule],
  exports: [NotificacionesAdminsService],
  providers: [NotificacionesAdminsService],
})
export class NotificacionesAdminsModule {}
