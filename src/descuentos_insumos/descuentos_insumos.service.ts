import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDescuentosInsumoDto } from './dto/create-descuentos_insumo.dto';
import { UpdateDescuentosInsumoDto } from './dto/update-descuentos_insumo.dto';
import { DescuentosInsumo } from './entities/descuentos_insumo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Injectable()
export class DescuentosInsumosService {
  constructor(
    @InjectRepository(DescuentosInsumo)
    private readonly descuentoRepository: Repository<DescuentosInsumo>,
    @InjectRepository(Insumo)
    private readonly insumpRepository: Repository<Insumo>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
  ) {}
  async create(createDescuentosInsumoDto: CreateDescuentosInsumoDto) {
    const {
      cantidad_comprada,
      descuentos,
      insumoId,
      paisId,
      proveedorId,
      isActive,
    } = createDescuentosInsumoDto;
    try {
      const insumo_existe = await this.insumpRepository.findOne({
        where: { id: insumoId },
      });
      if (!insumo_existe)
        throw new NotFoundException('No se encontro el insumo seleccionado');

      const proveedor_existe = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_existe)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const pais_existe = await this.paisRepository.findOne({
        where: { id: paisId },
      });
      if (!pais_existe)
        throw new NotFoundException('No se encontro el pais seleccionado');

      const descuento = this.descuentoRepository.create({
        cantidad_comprada,
        descuentos,
        isActive,
        insumo: insumo_existe,
        pais: pais_existe,
        proveedor: proveedor_existe,
      });

      await this.descuentoRepository.save(descuento);

      return 'Descuento creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const descuentos = await this.descuentoRepository.find({
        relations: ['insumo', 'proveedor', 'pais'],
        order: { id: 'ASC' },
      });

      if (descuentos.length === 0) {
        throw new NotFoundException('No se encontraron descuentos');
      }

      return descuentos;
    } catch (error) {
      throw error;
    }
  }

  async findDescuentoInsumo(insumoId: string) {
    try {
      const insumo_existe = await this.insumpRepository.findOne({
        where: { id: insumoId },
      });
      if (!insumo_existe)
        throw new NotFoundException('No se encontro el insumo seleccionado');
      const descuentos = await this.descuentoRepository.find({
        where: { insumo: { id: insumoId } },
        relations: ['insumo', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (descuentos.length === 0) {
        throw new NotFoundException('No se encontraron descuentos');
      }

      return descuentos;
    } catch (error) {
      throw error;
    }
  }

  async findByProveedorAndInsumo(proveedorId: string, insumoId: string) {
    try {
      const [proveedor, inusmo] = await Promise.all([
        this.proveedorRepository.findOne({ where: { id: proveedorId } }),
        this.insumpRepository.findOne({ where: { id: insumoId } }),
      ]);

      if (!proveedor) {
        throw new NotFoundException('No se encontró el proveedor seleccionado');
      }

      if (!inusmo) {
        throw new NotFoundException('No se encontró el insumo seleccionado');
      }

      const descuentos = await this.descuentoRepository.find({
        where: {
          proveedor: { id: proveedorId },
          insumo: { id: insumoId },
          isActive: true,
        },
        relations: ['insumo', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (descuentos.length === 0) {
        throw new NotFoundException(
          'No se encontraron descuentos para esta combinación de proveedor e insumo',
        );
      }

      return descuentos;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateDescuentosInsumoDto: UpdateDescuentosInsumoDto,
  ) {
    try {
      const { cantidad_comprada, descuentos, insumoId, isActive } =
        updateDescuentosInsumoDto;

      const descuentoExistente = await this.descuentoRepository.findOne({
        where: { id },
        relations: ['insumo'],
      });

      if (!descuentoExistente) {
        throw new NotFoundException(`Descuento con ID ${id} no encontrado`);
      }

      if (insumoId && insumoId !== descuentoExistente.insumo.id) {
        const nuevoInsumo = await this.insumpRepository.findOne({
          where: { id: insumoId },
        });

        if (!nuevoInsumo) {
          throw new NotFoundException('No se encontro el insumo seleccionado');
        }

        const descuentoDuplicado = await this.descuentoRepository.findOne({
          where: { insumo: { id: insumoId } },
        });

        if (descuentoDuplicado && descuentoDuplicado.id !== id) {
          throw new BadRequestException(
            'El nuevo insumo ya tiene un descuento asignado',
          );
        }

        descuentoExistente.insumo = nuevoInsumo;
      }

      if (cantidad_comprada !== undefined) {
        descuentoExistente.cantidad_comprada = cantidad_comprada;
      }

      if (descuentos !== undefined) {
        descuentoExistente.descuentos = descuentos;
      }

      if (isActive !== undefined) {
        descuentoExistente.isActive = isActive;
      }

      await this.descuentoRepository.save(descuentoExistente);

      return 'Descuento actualizado exitosamente';
    } catch (error) {
      throw error;
    }
  }
}
