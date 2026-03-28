import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificacionesAdmin } from './entities/notificaciones_admin.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';
import { NotificationType } from 'src/interfaces/nptificaciones.type';
import { CreateNotificacionesAdminDto } from './dto/create-notificaciones_admin.dto';

@Injectable()
export class NotificacionesAdminsService {
  constructor(
    @InjectRepository(NotificacionesAdmin)
    private readonly notifitacionRepo: Repository<NotificacionesAdmin>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createNotification: CreateNotificacionesAdminDto) {
    const { message, title, type } = createNotification;

    const admins = await this.userRepo.find({
      where: { role: { name: ValidRoles.Administrador } },
      relations: ['role'],
    });

    const notifications = admins.map((admin) =>
      this.notifitacionRepo.create({
        type,
        title,
        message,
        user: admin,
      }),
    );
    await this.notifitacionRepo.save(notifications);
  }

  async notifyAdmins(type: NotificationType, title: string, message: string) {
    try {
      const admins = await this.userRepo.find({
        where: { role: { name: ValidRoles.Administrador } },
        relations: ['role'],
      });

      const notifications = admins.map((admin) =>
        this.notifitacionRepo.create({
          type,
          title,
          message,
          user: admin,
        }),
      );

      await this.notifitacionRepo.save(notifications);
      return 'Notificacion enviada con exito';
    } catch (error) {
      throw error;
    }
  }

  async findAllNoRead(user: User) {
    const userId = user.id ?? '';
    try {
      const usuario_exist = await this.userRepo.findOne({
        where: { id: userId },
      });
      if (!usuario_exist)
        throw new NotFoundException(
          'No se encontro el usuario que realiza la solicitud',
        );
      const notificaciones = await this.notifitacionRepo.find({
        where: { user: { id: userId }, read: false },
      });
      if (!notificaciones || notificaciones.length === 0) {
        throw new NotFoundException(
          'No se encontraron notificaciones en este momento',
        );
      }
      return notificaciones;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} notificacionesAdmin`;
  }

  async receivedNotification(id: string) {
    const notification = await this.notifitacionRepo.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    notification.read = true;

    await this.notifitacionRepo.save(notification);

    return 'Notificación marcada como leída';
  }

  remove(id: number) {
    return `This action removes a #${id} notificacionesAdmin`;
  }
}
