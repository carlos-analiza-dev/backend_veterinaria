import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RangoFactura, EstadoRango } from './entities/rango-factura.entity';
import { CreateRangoFacturaDto } from './dto/create-rango-factura.dto';
import { UpdateRangoFacturaDto } from './dto/update-rango-factura.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class RangosFacturaService {
  constructor(
    @InjectRepository(RangoFactura)
    private readonly rangoRepository: Repository<RangoFactura>,
  ) {}

  async create(createRangoFacturaDto: CreateRangoFacturaDto) {
    const rangoActivo = await this.rangoRepository.findOne({
      where: { estado: EstadoRango.ACTIVO },
    });

    if (rangoActivo) {
      throw new BadRequestException(
        'Ya existe un rango activo. Debe cerrar el rango actual antes de crear uno nuevo.',
      );
    }

    if (createRangoFacturaDto.rango_inicial >= createRangoFacturaDto.rango_final) {
      throw new BadRequestException(
        'El rango inicial debe ser menor que el rango final',
      );
    }

    const nuevoRango = this.rangoRepository.create({
      ...createRangoFacturaDto,
      correlativo_actual: createRangoFacturaDto.rango_inicial - 1,
      facturas_anuladas: createRangoFacturaDto.facturas_anuladas || [],
    });

    return await this.rangoRepository.save(nuevoRango);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const queryBuilder = this.rangoRepository
      .createQueryBuilder('rango')
      .orderBy('rango.created_at', 'DESC')
      .skip(offset)
      .take(limit);

    const [rangos, total] = await queryBuilder.getManyAndCount();

    return {
      data: instanceToPlain(rangos),
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const rango = await this.rangoRepository.findOne({
      where: { id },
    });

    if (!rango) {
      throw new NotFoundException(`Rango de factura con ID ${id} no encontrado`);
    }

    return rango;
  }

  async obtenerRangoActivo() {
    const rangoActivo = await this.rangoRepository.findOne({
      where: { estado: EstadoRango.ACTIVO },
    });

    if (!rangoActivo) {
      throw new NotFoundException('No hay rango de facturación activo');
    }

    const hoy = new Date();
    if (rangoActivo.fecha_limite_emision < hoy) {
      rangoActivo.estado = EstadoRango.VENCIDO;
      await this.rangoRepository.save(rangoActivo);
      throw new BadRequestException('El rango activo ha vencido');
    }

    return rangoActivo;
  }

  async obtenerSiguienteNumero(): Promise<string> {
    const rangoActivo = await this.rangoRepository
      .createQueryBuilder('rango')
      .where('rango.estado = :estado', { estado: EstadoRango.ACTIVO })
      .andWhere('rango.fecha_limite_emision > :fecha', { fecha: new Date() })
      .andWhere('rango.correlativo_actual < rango.rango_final')
      .getOne();

    if (!rangoActivo) {
      throw new BadRequestException('No hay rangos de facturación activos disponibles');
    }

    const siguienteCorrelativo = rangoActivo.correlativo_actual + 1;
    const numeroFormateado = rangoActivo.prefijo +
      siguienteCorrelativo.toString().padStart(8, '0');

    rangoActivo.correlativo_actual = siguienteCorrelativo;

    if (siguienteCorrelativo >= rangoActivo.rango_final) {
      rangoActivo.estado = EstadoRango.AGOTADO;
    }

    await this.rangoRepository.save(rangoActivo);

    return numeroFormateado;
  }

  async update(id: number, updateRangoFacturaDto: UpdateRangoFacturaDto) {
    const rango = await this.findOne(id);

    if (updateRangoFacturaDto.rango_inicial && updateRangoFacturaDto.rango_final) {
      if (updateRangoFacturaDto.rango_inicial >= updateRangoFacturaDto.rango_final) {
        throw new BadRequestException(
          'El rango inicial debe ser menor que el rango final',
        );
      }
    }

    Object.assign(rango, updateRangoFacturaDto);

    return await this.rangoRepository.save(rango);
  }

  async anularFacturasNoUsadas(id: number) {
    const rango = await this.findOne(id);

    if (rango.estado !== EstadoRango.ACTIVO) {
      throw new BadRequestException('Solo se pueden anular facturas de rangos activos');
    }

    const facturasNoUsadas = [];
    for (let i = rango.correlativo_actual + 1; i <= rango.rango_final; i++) {
      facturasNoUsadas.push(i);
    }

    rango.facturas_anuladas = [...(rango.facturas_anuladas || []), ...facturasNoUsadas];
    rango.estado = EstadoRango.ANULADO;

    await this.rangoRepository.save(rango);

    return {
      message: `Se anularon ${facturasNoUsadas.length} facturas no utilizadas`,
      facturas_anuladas: facturasNoUsadas,
    };
  }

  async verificarVencimientos() {
    const hoy = new Date();

    const rangosVencidos = await this.rangoRepository
      .createQueryBuilder('rango')
      .where('rango.estado = :estado', { estado: EstadoRango.ACTIVO })
      .andWhere('rango.fecha_limite_emision < :fecha', { fecha: hoy })
      .getMany();

    for (const rango of rangosVencidos) {
      rango.estado = EstadoRango.VENCIDO;
      await this.rangoRepository.save(rango);
    }

    return {
      rangos_vencidos: rangosVencidos.length,
      message: `Se actualizaron ${rangosVencidos.length} rangos vencidos`,
    };
  }

  async remove(id: number) {
    const rango = await this.findOne(id);

    if (rango.estado === EstadoRango.ACTIVO) {
      throw new BadRequestException('No se puede eliminar un rango activo');
    }

    await this.rangoRepository.remove(rango);

    return {
      message: 'Rango de factura eliminado exitosamente',
    };
  }
}