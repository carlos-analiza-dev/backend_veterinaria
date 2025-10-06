import { Injectable } from '@nestjs/common';
import { CreateFacturaDetalleDto } from './dto/create-factura_detalle.dto';
import { UpdateFacturaDetalleDto } from './dto/update-factura_detalle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FacturaDetalle } from './entities/factura_detalle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacturaDetalleService {
  constructor(
    @InjectRepository(FacturaDetalle)
    private readonly facturaDetalleRepository: Repository<FacturaDetalle>,
  ) {}
  async create(createFacturaDetalleDto: CreateFacturaDetalleDto) {
    const detalle = this.facturaDetalleRepository.create(
      createFacturaDetalleDto,
    );

    detalle.calcularTotal();

    return await this.facturaDetalleRepository.save(detalle);
  }

  async crearMultiplesDetalles(
    detallesDto: CreateFacturaDetalleDto[],
  ): Promise<FacturaDetalle[]> {
    const detalles = detallesDto.map((dto) => {
      const detalle = this.facturaDetalleRepository.create(dto);
      detalle.calcularTotal();
      return detalle;
    });

    return await this.facturaDetalleRepository.save(detalles);
  }

  async findByFacturaId(id_factura: string): Promise<FacturaDetalle[]> {
    return await this.facturaDetalleRepository.find({
      where: { id_factura },
      relations: ['producto_servicio'],
      order: { created_at: 'ASC' },
    });
  }

  async calcularSubtotalFactura(id_factura: string): Promise<number> {
    const result = await this.facturaDetalleRepository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.total)', 'subtotal')
      .where('detalle.id_factura = :id_factura', { id_factura })
      .getRawOne();

    return parseFloat(result.subtotal) || 0;
  }
}
