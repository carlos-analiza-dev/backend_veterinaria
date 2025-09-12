import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEscalasProductoDto } from './dto/create-escalas_producto.dto';
import { UpdateEscalasProductoDto } from './dto/update-escalas_producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EscalasProducto } from './entities/escalas_producto.entity';
import { Repository } from 'typeorm';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Injectable()
export class EscalasProductoService {
  constructor(
    @InjectRepository(EscalasProducto)
    private readonly escalasRepo: Repository<EscalasProducto>,
    @InjectRepository(SubServicio)
    private readonly productoRepo: Repository<SubServicio>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
  ) {}

  async create(createEscalasProductoDto: CreateEscalasProductoDto) {
    const {
      cantidad_comprada,
      costo,
      bonificacion,
      productoId,
      proveedorId,
      paisId,
      isActive,
    } = createEscalasProductoDto;
    try {
      const producto_existe = await this.productoRepo.findOne({
        where: { id: productoId },
      });
      if (!producto_existe)
        throw new NotFoundException('No se encontro el producto seleccionado');

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

      const escala = this.escalasRepo.create({
        cantidad_comprada,
        bonificacion,
        costo,
        isActive,
        producto: producto_existe,
        pais: pais_existe,
        proveedor: proveedor_existe,
      });
      await this.escalasRepo.save(escala);
      return 'Escala del producto creada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const escalas = await this.escalasRepo.find({
        relations: ['producto'],
        order: { cantidad_comprada: 'ASC' },
      });
      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const escala = await this.escalasRepo.findOne({
        where: { id },
        relations: ['producto'],
      });

      if (!escala) {
        throw new NotFoundException(`Escala con ID ${id} no encontrada`);
      }

      return escala;
    } catch (error) {
      throw error;
    }
  }

  async findByProducto(paginationDto: PaginationDto, productoId: string) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const [escalas, total] = await this.escalasRepo.findAndCount({
        where: { producto: { id: productoId } },
        relations: ['producto', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
        take: limit,
        skip: offset,
      });

      if (!escalas || escalas.length === 0) {
        throw new NotFoundException(
          `No se encontraron escalas para el producto con ID ${productoId}`,
        );
      }

      return {
        data: escalas,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async findByProveedorAndProducto(proveedorId: string, productoId: string) {
    try {
      const [proveedor, producto] = await Promise.all([
        this.proveedorRepository.findOne({ where: { id: proveedorId } }),
        this.productoRepo.findOne({ where: { id: productoId } }),
      ]);

      if (!proveedor) {
        throw new NotFoundException('No se encontró el proveedor seleccionado');
      }

      if (!producto) {
        throw new NotFoundException('No se encontró el producto seleccionado');
      }

      const escalas = await this.escalasRepo.find({
        where: {
          proveedor: { id: proveedorId },
          producto: { id: productoId },
          isActive: true,
        },
        relations: ['producto', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (escalas.length === 0) {
        throw new NotFoundException(
          'No se encontraron escalas para esta combinación de proveedor y producto',
        );
      }

      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async findByProductoEscalas(productoId: string) {
    try {
      const escalas = await this.escalasRepo.find({
        where: { producto: { id: productoId } },
        relations: ['producto', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (!escalas || escalas.length === 0) {
        throw new NotFoundException(
          `No se encontraron escalas para el producto con ID ${productoId}`,
        );
      }

      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateEscalasProductoDto: UpdateEscalasProductoDto) {
    try {
      const escala = await this.escalasRepo.findOne({
        where: { id },
      });

      if (!escala) {
        throw new NotFoundException(`Escala con ID ${id} no encontrada`);
      }

      if (updateEscalasProductoDto.productoId) {
        const producto_existe = await this.productoRepo.findOne({
          where: { id: updateEscalasProductoDto.productoId },
        });
        if (!producto_existe) {
          throw new NotFoundException(
            'No se encontró el producto seleccionado',
          );
        }
      }

      await this.escalasRepo.update(id, updateEscalasProductoDto);

      const escalaActualizada = await this.escalasRepo.findOne({
        where: { id },
        relations: ['producto'],
      });

      return {
        message: 'Escala actualizada exitosamente',
        data: escalaActualizada,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const escala = await this.escalasRepo.findOne({
        where: { id },
      });

      if (!escala) {
        throw new NotFoundException(`Escala con ID ${id} no encontrada`);
      }

      await this.escalasRepo.remove(escala);

      return {
        message: 'Escala eliminada exitosamente',
        data: escala,
      };
    } catch (error) {
      throw error;
    }
  }

  async removeByProducto(productoId: string) {
    try {
      const escalas = await this.escalasRepo.find({
        where: { producto: { id: productoId } },
      });

      if (!escalas || escalas.length === 0) {
        throw new NotFoundException(
          `No se encontraron escalas para el producto con ID ${productoId}`,
        );
      }

      await this.escalasRepo.remove(escalas);

      return {
        message: `Todas las escalas del producto ${productoId} eliminadas exitosamente`,
        count: escalas.length,
      };
    } catch (error) {
      throw error;
    }
  }
}
