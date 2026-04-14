import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductosGanaderia } from 'src/productos_ganaderia/entities/productos_ganaderia.entity';

import { CreateInventarioProductosGanaderiaDto } from './dto/create-inventario_productos_ganaderia.dto';
import { UpdateInventarioProductosGanaderiaDto } from './dto/update-inventario_productos_ganaderia.dto';
import { InventarioProductosGanaderia } from './entities/inventario_productos_ganaderia.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { instanceToPlain } from 'class-transformer';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { getPropietarioId } from 'src/utils/get-propietario-id';

@Injectable()
export class InventarioProductosGanaderiaService {
  constructor(
    @InjectRepository(InventarioProductosGanaderia)
    private readonly inventarioRepository: Repository<InventarioProductosGanaderia>,

    @InjectRepository(ProductosGanaderia)
    private readonly productoRepository: Repository<ProductosGanaderia>,

    @InjectRepository(FincasGanadero)
    private readonly fincaRepository: Repository<FincasGanadero>,
  ) {}

  async create(
    createDto: CreateInventarioProductosGanaderiaDto,
    cliente: Cliente,
  ) {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id: createDto.productoId },
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }

      const finca = await this.fincaRepository.findOne({
        where: { id: createDto.fincaId },
      });

      if (!finca) {
        throw new NotFoundException('Finca no encontrada');
      }

      const inventarioExistente = await this.inventarioRepository.findOne({
        where: {
          producto: { id: producto.id },
          finca: { id: finca.id },
        },
        relations: ['producto', 'finca'],
      });

      if (inventarioExistente) {
        inventarioExistente.cantidad =
          Number(inventarioExistente.cantidad) + Number(createDto.cantidad);

        if (createDto.stockMinimo) {
          inventarioExistente.stockMinimo = createDto.stockMinimo;
        }

        if (createDto.unidadMedida !== inventarioExistente.unidadMedida) {
          throw new BadRequestException(
            `La unidad de medida no coincide con la que ingresaste, la unidad de medidad debe ser: ${inventarioExistente.unidadMedida}`,
          );
        }

        await this.inventarioRepository.save(inventarioExistente);

        return 'Cantidad agregada al inventario existente';
      }

      const inventario = this.inventarioRepository.create({
        cantidad: createDto.cantidad,
        unidadMedida: createDto.unidadMedida,
        stockMinimo: createDto.stockMinimo,
        producto,
        finca,
        creadoPorId: cliente.id,
      });

      await this.inventarioRepository.save(inventario);

      return 'Inventario creado con éxito';
    } catch (error) {
      throw error;
    }
  }

  async findAll(cliente: Cliente, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, fincaId = '' } = paginationDto;
    const propietario = getPropietarioId(cliente);

    const queryBuilder = this.inventarioRepository
      .createQueryBuilder('inventario')
      .leftJoinAndSelect('inventario.producto', 'producto')
      .leftJoinAndSelect('producto.propietario', 'propietario')
      .leftJoinAndSelect('inventario.finca', 'finca')
      .where('propietario.id = :propietario', { propietario })
      .orderBy('inventario.createdAt', 'DESC');

    if (fincaId && fincaId.trim() !== '') {
      queryBuilder.andWhere('finca.id = :fincaId', { fincaId });
    }

    queryBuilder.skip(offset).take(limit);

    const [inventario, total] = await queryBuilder.getManyAndCount();

    return {
      data: instanceToPlain(inventario),
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string): Promise<InventarioProductosGanaderia> {
    const inventario = await this.inventarioRepository.findOne({
      where: { id },
      relations: ['producto'],
    });

    if (!inventario) {
      throw new NotFoundException('Inventario no encontrado');
    }

    return inventario;
  }

  async update(
    id: string,
    updateDto: UpdateInventarioProductosGanaderiaDto,
    cliente: Cliente,
  ): Promise<InventarioProductosGanaderia> {
    const inventario = await this.findOne(id);

    Object.assign(inventario, updateDto);

    return await this.inventarioRepository.save({
      ...inventario,
      actualizadoPorId: cliente.id,
    });
  }

  async remove(id: string) {
    const inventario = await this.findOne(id);

    await this.inventarioRepository.remove(inventario);

    return {
      message: 'Inventario eliminado correctamente',
    };
  }
}
