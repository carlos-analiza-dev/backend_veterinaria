import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { EstadoPedido, Pedido } from 'src/pedidos/entities/pedido.entity';

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

  async sendOrderConfirmation(
    email: string,
    nombre_cliente: string,
    pedido: {
      id: string;
      created_at: Date;
      estado: string;
      tipo_entrega: string;
      direccion_entrega?: string;
      nombre_finca?: string;
      sucursal?: { nombre: string };
      sub_total: number;
      importe_exento: number;
      importe_exonerado: number;
      importe_gravado_15: number;
      importe_gravado_18: number;
      isv_15: number;
      isv_18: number;
      total: number;
      costo_delivery: number;
      detalles: Array<{
        cantidad: number;
        precio: number;
        producto: { nombre: string };
      }>;
    },
    moneda: string,
  ) {
    if (!email) throw new BadRequestException('No se proporcionó un correo');

    try {
      const fecha_pedido = new Date(pedido.created_at).toLocaleString('es-HN', {
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const total_impuestos = pedido.isv_15 + pedido.isv_18;

      const productos = pedido.detalles.map((detalle) => ({
        nombre_producto: detalle.producto.nombre,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio.toFixed(2),
        subtotal: (detalle.precio * detalle.cantidad).toFixed(2),
      }));

      const mostrar_desglose_impuestos =
        pedido.importe_exento > 0 || pedido.isv_15 > 0 || pedido.isv_18 > 0;

      await this.mailerService.sendMail({
        to: email,
        subject: `✅ Confirmación de Pedido #${pedido.id.slice(0, 8).toUpperCase()} - El Sembrador`,
        template: './nuevo-pedido',
        context: {
          nombre_cliente,
          pedido_id: pedido.id.slice(0, 8).toUpperCase(),
          fecha_pedido,
          estado_pedido: pedido.estado.toUpperCase(),
          tipo_entrega:
            pedido.tipo_entrega === 'delivery'
              ? 'Delivery a domicilio'
              : 'Recoger en sucursal',
          sucursal_asignada: pedido.sucursal?.nombre || null,
          direccion_entrega: pedido.direccion_entrega || null,
          nombre_finca: pedido.nombre_finca || null,
          moneda: moneda,
          productos,
          sub_total: pedido.sub_total.toFixed(2),
          total_impuestos: total_impuestos.toFixed(2),
          costo_delivery: pedido.costo_delivery.toFixed(2),
          total: pedido.total.toFixed(2),
          mostrar_desglose_impuestos,
          importe_exento: pedido.importe_exento.toFixed(2),
          isv_15: pedido.isv_15.toFixed(2),
          isv_18: pedido.isv_18.toFixed(2),
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Correo de confirmación de pedido enviado' };
    } catch (error) {
      throw new Error(`Fallo al enviar correo de confirmación de pedido`);
    }
  }

  async notificarCambioEstado(
    pedido: Pedido,
    cliente: Cliente,
    nuevoEstado: EstadoPedido,
  ) {
    const mensajes = {
      pendiente: {
        titulo: '🟡 Pedido en revisión',
        mensaje: 'Hemos recibido su pedido y está en proceso de validación.',
      },
      procesado: {
        titulo: '🟢 Pedido procesado',
        mensaje: 'Su pedido ha sido procesado y está siendo preparado.',
      },
      facturado: {
        titulo: '📦 Pedido facturado',
        mensaje: 'Su pedido ha sido facturado y está listo para entrega.',
      },
      cancelado: {
        titulo: '🔴 Pedido cancelado',
        mensaje:
          'Su pedido ha sido cancelado. Contacte soporte si necesita ayuda.',
      },
    };

    const estadoInfo = mensajes[nuevoEstado];
    const moneda = cliente.pais?.simbolo_moneda || 'L';

    const estadoLowercase = nuevoEstado.toLowerCase();

    const esPendiente = nuevoEstado === 'pendiente';
    const esProcesado = nuevoEstado === 'procesado';
    const esFacturado = nuevoEstado === 'facturado';
    const esCancelado = nuevoEstado === 'cancelado';
    const esDelivery = pedido.tipo_entrega === 'delivery';

    const detallesFormateados = pedido.detalles.map((d) => ({
      cantidad: d.cantidad,
      precio: Number(d.precio).toFixed(2),
      subtotal: (Number(d.precio) * d.cantidad).toFixed(2),
      producto: { nombre: d.producto?.nombre || 'Producto' },
    }));

    const pedidoFormateado = {
      id: pedido.id,
      created_at: pedido.created_at,
      fecha_pedido: new Date(pedido.created_at).toLocaleString('es-HN', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
      estado: nuevoEstado,
      tipo_entrega:
        pedido.tipo_entrega === 'delivery'
          ? 'Delivery a domicilio'
          : 'Recoger en sucursal',
      direccion_entrega: pedido.direccion_entrega,
      nombre_finca: pedido.nombre_finca,
      sucursal_asignada: pedido.sucursal?.nombre,
      sub_total: Number(pedido.sub_total).toFixed(2),
      importe_exento: Number(pedido.importe_exento).toFixed(2),
      importe_exonerado: Number(pedido.importe_exonerado).toFixed(2),
      importe_gravado_15: Number(pedido.importe_gravado_15).toFixed(2),
      importe_gravado_18: Number(pedido.importe_gravado_18).toFixed(2),
      isv_15: Number(pedido.isv_15).toFixed(2),
      isv_18: Number(pedido.isv_18).toFixed(2),
      total: Number(pedido.total).toFixed(2),
      costo_delivery: Number(pedido.costo_delivery).toFixed(2),
      detalles: detallesFormateados,
    };

    await this.mailerService.sendMail({
      to: cliente.email,
      subject: `${estadoInfo.titulo} - Pedido #${pedido.id.slice(0, 8).toUpperCase()}`,
      template: './cambio-estado-pedido',
      context: {
        nombre_cliente: cliente.nombre,
        pedido_id: pedido.id.slice(0, 8).toUpperCase(),
        estado_pedido: nuevoEstado.toUpperCase(),
        mensaje_estado: estadoInfo.mensaje,
        moneda,
        app_url:
          process.env.FRONTEND_URL_CLIENT || 'https://app.elsembrador.com',
        year: new Date().getFullYear(),

        estado_pedido_lowercase: estadoLowercase,

        estado_pedido_pendiente: esPendiente,
        estado_pedido_procesado: esProcesado,
        estado_pedido_facturado: esFacturado,
        estado_pedido_cancelado: esCancelado,
        es_delivery: esDelivery,

        ...pedidoFormateado,
      },
    });
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

  async sendMantenimientoProximo(
    email: string,
    nombre_propietario: string,
    nombre_equipo: string,
    codigo: string,
    nombre_finca: string,
    fecha: string,
  ) {
    if (!email) throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '⚠️ Mantenimiento próximo de equipo',
        template: './mantenimiento-proximo',
        context: {
          nombre_propietario,
          nombre_equipo,
          codigo,
          nombre_finca,
          fecha,
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Correo de mantenimiento enviado' };
    } catch (error) {
      throw new Error('Error enviando correo de mantenimiento');
    }
  }

  async sendMantenimientoPorFinalizar(
    email: string,
    nombre_propietario: string,
    nombre_equipo: string,
    fecha_final: string,
  ) {
    if (!email) throw new BadRequestException('No se proporcionó un correo');

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '⏰ Mantenimiento por finalizar',
        template: './mantenimiento-finalizar',
        context: {
          nombre_propietario,
          nombre_equipo,
          fecha_final,
          year: new Date().getFullYear(),
        },
      });

      return { message: 'Correo de mantenimiento por finalizar enviado' };
    } catch (error) {
      throw new Error('Error enviando correo de mantenimiento por finalizar');
    }
  }
}
