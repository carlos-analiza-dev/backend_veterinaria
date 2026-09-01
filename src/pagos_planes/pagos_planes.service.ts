import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePagosPlaneDto } from './dto/create-pagos_plane.dto';
import { UpdatePagosPlaneDto } from './dto/update-pagos_plane.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EstadoPago,
  PagosPlane,
  TipoPrecio,
} from './entities/pagos_plane.entity';
import { Repository } from 'typeorm';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { WompiService } from 'src/validations/wompi/wompi.service';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaquetePais } from 'src/paquete_pais/entities/paquete_pai.entity';

@Injectable()
export class PagosPlanesService {
  constructor(
    @InjectRepository(PagosPlane)
    private readonly pagoRepository: Repository<PagosPlane>,

    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(PaquetePais)
    private readonly paquetePaisRepository: Repository<PaquetePais>,
    private readonly wompiService: WompiService,
  ) {}
  async crearPago(cliente: Cliente, createPagosPlaneDto: CreatePagosPlaneDto) {
    const { paqueteId, tipoPrecio } = createPagosPlaneDto;

    const paquete = await this.paqueteRepository.findOne({
      where: {
        id: paqueteId,
        isActive: true,
      },
    });

    if (!paquete) {
      throw new NotFoundException('Paquete no encontrado');
    }

    const paquetePais = await this.paquetePaisRepository.findOne({
      where: {
        paquete: {
          id: paquete.id,
        },
        pais: {
          id: cliente.pais.id,
        },
        isActive: true,
      },
    });

    if (!paquetePais) {
      throw new NotFoundException(
        'Este paquete no está disponible para tu país',
      );
    }

    let monto: number;

    if (tipoPrecio === TipoPrecio.MENSUAL) {
      monto = Number(paquetePais.precioMensual);
    } else {
      if (!paquetePais.precioAnual) {
        throw new BadRequestException(
          'Este paquete no tiene precio anual disponible',
        );
      }

      monto = Number(paquetePais.precioAnual);
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      throw new BadRequestException(
        'El monto del paquete debe ser mayor a cero',
      );
    }

    const referencia = `PKG-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const pago = this.pagoRepository.create({
      referencia,
      clienteId: cliente.id,
      paqueteId: paquete.id,
      monto: monto.toFixed(2),
      tipoPrecio,
      estado: EstadoPago.PENDIENTE,
    });

    await this.pagoRepository.save(pago);

    try {
      const transaccion = await this.wompiService.crearTransaccion3DS({
        ...createPagosPlaneDto.tarjeta,

        monto,

        nombre: cliente.nombre,

        email: cliente.email,

        referencia,
      });

      pago.wompiTransaccionId = transaccion.idTransaccion;

      pago.respuestaWompi = transaccion;

      await this.pagoRepository.save(pago);

      return {
        pagoId: pago.id,

        referencia: pago.referencia,

        transaccionId: transaccion.idTransaccion,

        urlPago: transaccion.urlCompletarPago3Ds,

        monto: pago.monto,

        tipoPrecio: pago.tipoPrecio,

        paquete: {
          id: paquete.id,
          nombre: paquete.nombre,
          tipo: paquete.tipo,
        },
      };
    } catch (error) {
      pago.estado = EstadoPago.ERROR;

      await this.pagoRepository.save(pago);

      throw error;
    }
  }
  findAll() {
    return `This action returns all pagosPlanes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pagosPlane`;
  }

  update(id: number, updatePagosPlaneDto: UpdatePagosPlaneDto) {
    return `This action updates a #${id} pagosPlane`;
  }

  remove(id: number) {
    return `This action removes a #${id} pagosPlane`;
  }
}
