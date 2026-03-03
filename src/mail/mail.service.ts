import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailConfirm(email: string, newPassword: string) {
    if (!email) throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Contraseña Actualizada',
        template: './confirm-correo',
        context: {
          email,
          newPassword,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async verifyAccount(email: string, name: string, verifyLink: string) {
    if (!email) throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verifica tu cuenta - El Sembrador',
        template: './verify-account',
        context: {
          name,
          verifyLink,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async verifyCreateClient(
    email_admin: string,
    name: string,
    email_user: string,
    phone: string,
    year: string,
  ) {
    if (!name)
      throw new BadRequestException('No se proporcionó el nombre del cliente');
    if (!email_user)
      throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email_admin,
        subject: 'Cliente Creado - EL Sembrado',
        template: './register-client',
        context: {
          name,
          email_user,
          phone,
          year,
        },
      });
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async sendEmailCrearCita(
    email_veterinario: string,
    nombre_veterinario: string,
    cliente: string,
    nombre_finca: string,
    hora_inicio: string,
    hora_fin: string,
  ) {
    if (!email_veterinario)
      throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email_veterinario,
        subject: 'Cita Pendiente',
        template: './cita-pendiente',
        context: {
          email_veterinario,
          nombre_veterinario,
          cliente,
          nombre_finca,
          hora_inicio,
          hora_fin,
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Cita enviada correctamente' };
    } catch (error) {
      throw new Error(`Failed to send cita: ${error.message}`);
    }
  }
}
