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
      throw new Error(`Fallo al enviar la cita`);
    }
  }

  async sendCitaConfirmadaCliente(
    email_cliente: string,
    nombre_cliente: string,
    codigo_cita: string,
    fecha: string,
    hora_inicio: string,
    hora_fin: string,
    nombre_veterinario: string,
    nombre_finca: string,
    cantidad_animales?: number,
    servicio?: string,
  ) {
    if (!email_cliente)
      throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email_cliente,
        subject: '✅ Cita Confirmada - El Sembrador',
        template: './cita-confirmada',
        context: {
          nombre_cliente,
          codigo_cita,
          fecha,
          hora_inicio,
          hora_fin,
          nombre_veterinario,
          nombre_finca,
          cantidad_animales,
          servicio,
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Correo de confirmación enviado al cliente' };
    } catch (error) {
      throw new Error(`Fallo al enviar correo de confirmación`);
    }
  }

  async sendCitaCanceladaCliente(
    email_cliente: string,
    nombre_cliente: string,
    codigo_cita: string,
    fecha: string,
    hora_inicio: string,
    hora_fin: string,
    nombre_finca: string,
    motivo_cancelacion?: string,
  ) {
    if (!email_cliente)
      throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email_cliente,
        subject: '❌ Cita Cancelada - El Sembrador',
        template: './cita-cancelada',
        context: {
          nombre_cliente,
          codigo_cita,
          fecha,
          hora_inicio,
          hora_fin,
          nombre_finca,
          motivo_cancelacion: motivo_cancelacion || 'No especificado',
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Correo de cancelación enviado al cliente' };
    } catch (error) {
      throw new Error(`Fallo al enviar correo de cancelación`);
    }
  }

  async sendCitaCompletadaCliente(
    email_cliente: string,
    nombre_cliente: string,
    codigo_cita: string,
    fecha: string,
    nombre_veterinario: string,
    nombre_finca: string,
    servicio?: string,
    total_pagar?: number,
    simbolo_moneda?: string,
    forma_pago?: string,
  ) {
    if (!email_cliente)
      throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email_cliente,
        subject: '✅ Cita Completada - El Sembrador',
        template: './cita-completada',
        context: {
          nombre_cliente,
          codigo_cita,
          fecha,
          nombre_veterinario,
          nombre_finca,
          servicio,
          total_pagar,
          simbolo_moneda: simbolo_moneda || 'L',
          forma_pago,
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Correo de cita completada enviado al cliente' };
    } catch (error) {
      throw new Error(`Fallo al enviar correo de cita completada`);
    }
  }

  async sendNuevaActividadTrabajador(
    email_trabajador: string,
    nombre_trabajador: string,
    nombre_propietario: string,
    nombre_finca: string,
    titulo_actividad: string,
    tipo_actividad: string,
    fecha_programada: string,
    frecuencia: string,
    descripcion?: string,
  ) {
    if (!email_trabajador) {
      console.warn('No se proporcionó un correo para el trabajador');
      return { message: 'No se envió notificación: correo no proporcionado' };
    }

    try {
      await this.mailerService.sendMail({
        to: email_trabajador,
        subject: '📋 Nueva Actividad Asignada - El Sembrador',
        template: './nueva-actividad',
        context: {
          nombre_trabajador: nombre_trabajador || 'Trabajador',
          nombre_propietario: nombre_propietario || 'Propietario',
          nombre_finca: nombre_finca || 'No especificada',
          titulo_actividad: titulo_actividad || 'Actividad',
          tipo_actividad: tipo_actividad || 'General',
          fecha_programada:
            fecha_programada || new Date().toISOString().split('T')[0],
          frecuencia: frecuencia || 'Única',
          descripcion: descripcion || '',
          app_url: process.env.APP_URL || 'https://app.elsembrador.com',
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Notificación de actividad enviada al trabajador' };
    } catch (error) {
      return { message: 'No se pudo enviar la notificación por correo' };
    }
  }
  async sendActividadCompletada(
    email_propietario: string,
    nombre_propietario: string,
    nombre_trabajador: string,
    tipo_actividad: string,
    fecha_actividad: string,
    comentario?: string,
  ) {
    if (!email_propietario)
      throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email_propietario,
        subject: '✅ Actividad Completada - El Sembrador',
        template: './actividad-completada',
        context: {
          nombre_propietario,
          nombre_trabajador,
          tipo_actividad,
          fecha_actividad,
          comentario: comentario || '',
          year: new Date().getFullYear(),
          app_url: process.env.APP_URL || 'https://app.elsembrador.com',
        },
      });

      return {
        message: 'Notificación de actividad completada enviada al propietario',
      };
    } catch (error) {
      console.error('Error en sendActividadCompletada:', error);
      throw new Error(`Fallo al enviar notificación de actividad completada: `);
    }
  }
}
