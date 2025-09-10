import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatosProducto } from './entities/datos-producto.entity';
import { CreateDatosProductoDto } from './dto/create-datos-producto.dto';
import { UpdateDatosProductoDto } from './dto/update-datos-producto.dto';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class DatosProductosService {
  constructor(
    @InjectRepository(DatosProducto)
    private readonly datosProductoRepository: Repository<DatosProducto>,
    @InjectRepository(SubServicio)
    private readonly productoRepository: Repository<SubServicio>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async create(createDatosProductoDto: CreateDatosProductoDto) {
    try {
      const { precio, productoId, sucursalId, descuento, punto_reorden } =
        createDatosProductoDto;
      const producto_existe = await this.productoRepository.findOne({
        where: { id: productoId },
      });
      if (!producto_existe)
        throw new NotFoundException('No se encontro el producto seleccionado');

      const sucursal_existe = await this.sucursalRepository.findOne({
        where: { id: sucursalId },
      });
      if (!sucursal_existe)
        throw new NotFoundException('No se encontro la sucursal seleccionado');

      const productoEnSucursal = await this.datosProductoRepository.findOne({
        where: {
          producto: { id: productoId },
          sucursal: { id: sucursalId },
        },
        relations: ['producto', 'sucursal'],
      });

      if (productoEnSucursal) {
        throw new ConflictException('El producto ya existe en esta sucursal');
      }

      const datos = this.datosProductoRepository.create({
        descuento,
        precio,
        punto_reorden,
        producto: producto_existe,
        sucursal: sucursal_existe,
      });

      await this.datosProductoRepository.save(datos);

      return 'Datos del producto creados exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async getProductoSucursal(paginationDto: PaginationDto, productoId: string) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const [datos, total] = await this.datosProductoRepository.findAndCount({
        where: { producto: { id: productoId } },
        relations: ['producto', 'sucursal'],
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

      if (!datos || datos.length === 0) {
        throw new NotFoundException(
          'No se encontraron datos para este producto',
        );
      }

      return {
        total,
        datos,
      };
    } catch (error) {
      throw error;
    }
  }

  async checkPuntoReorden(sucursalId: string) {
    return await this.datosProductoRepository
      .createQueryBuilder('dp')
      .select(['dp.sub_servicioId', 'dp.punto_reorden', 'sub_servicio.nombre'])
      .leftJoin('dp.sub_servicio', 'sub_servicio')
      .where('dp.sucursalId = :sucursalId', { sucursalId })
      .andWhere('dp.punto_reorden > 0')
      .getMany();
  }

  async findAll(sucursalId?: string) {
    const queryBuilder = this.datosProductoRepository
      .createQueryBuilder('dp')
      .leftJoinAndSelect('dp.sub_servicio', 'sub_servicio')
      .leftJoinAndSelect('dp.sucursal', 'sucursal');

    if (sucursalId) {
      queryBuilder.where('dp.sucursalId = :sucursalId', { sucursalId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<DatosProducto> {
    const datos = await this.datosProductoRepository
      .createQueryBuilder('dp')
      .leftJoinAndSelect('dp.sub_servicio', 'sub_servicio')
      .leftJoinAndSelect('dp.sucursal', 'sucursal')
      .where('dp.id = :id', { id })
      .getOne();

    if (!datos) {
      throw new NotFoundException(
        `Datos de producto con ID ${id} no encontrados`,
      );
    }

    return datos;
  }

  async update(id: string, updateDatosProductoDto: UpdateDatosProductoDto) {
    try {
      const { precio, productoId, sucursalId, descuento, punto_reorden } =
        updateDatosProductoDto;

      const datosExistentes = await this.datosProductoRepository.findOne({
        where: { id },
        relations: ['producto', 'sucursal'],
      });
      if (!datosExistentes)
        throw new NotFoundException('No se encontraron los datos del producto');

      let producto_existe = datosExistentes.producto;
      if (productoId) {
        producto_existe = await this.productoRepository.findOne({
          where: { id: productoId },
        });
        if (!producto_existe)
          throw new NotFoundException(
            'No se encontró el producto seleccionado',
          );
      }

      let sucursal_existe = datosExistentes.sucursal;
      if (sucursalId) {
        sucursal_existe = await this.sucursalRepository.findOne({
          where: { id: sucursalId },
        });
        if (!sucursal_existe)
          throw new NotFoundException(
            'No se encontró la sucursal seleccionada',
          );
      }

      this.datosProductoRepository.merge(datosExistentes, {
        precio: precio ?? datosExistentes.precio,
        descuento: descuento ?? datosExistentes.descuento,
        punto_reorden: punto_reorden ?? datosExistentes.punto_reorden,
        producto: producto_existe,
        sucursal: sucursal_existe,
      });

      await this.datosProductoRepository.save(datosExistentes);

      return 'Datos del producto actualizados exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const datos = await this.findOne(id);
    await this.datosProductoRepository.remove(datos);
  }
}
