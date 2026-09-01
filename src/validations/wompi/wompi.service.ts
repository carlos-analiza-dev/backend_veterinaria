import { Injectable, InternalServerErrorException } from '@nestjs/common';

import axios from 'axios';

@Injectable()
export class WompiService {
  private readonly baseUrl = process.env.WOMPI_BASE_URL;
  private readonly apiSecret = process.env.WOMPI_API_SECRET;

  async crearTransaccion3DS(data: {
    numeroTarjeta: string;
    cvv: string;
    mesVencimiento: number;
    anioVencimiento: number;
    monto: number;
    nombre: string;
    email?: string;
    referencia: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/TransaccionCompra/3DS`,
        {
          tarjetaCreditoDebido: {
            numeroTarjeta: data.numeroTarjeta,
            cvv: data.cvv,
            mesVencimiento: data.mesVencimiento,
            anioVencimiento: data.anioVencimiento,
          },

          monto: data.monto,

          urlRedirect: `${process.env.FRONTEND_URL}/pagos/resultado`,

          nombre: data.nombre,

          configuracion: {
            urlWebhook: `${process.env.API_URL}/pagos/wompi/webhook`,
          },

          datosAdicionales: [
            {
              llave: 'referencia',
              valor: data.referencia,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiSecret}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error(error.response?.data || error.message);

      throw new InternalServerErrorException(
        'Error al crear la transacción en Wompi',
      );
    }
  }
}
