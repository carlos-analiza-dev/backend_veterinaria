import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatosProducto } from './entities/datos-producto.entity';
import { CreateDatosProductoDto } from './dto/create-datos-producto.dto';
import { UpdateDatosProductoDto } from './dto/update-datos-producto.dto';

@Injectable()
export class DatosProductosService {
  constructor(
    @InjectRepository(DatosProducto)
    private readonly datosProductoRepository: Repository<DatosProducto>,
  ) {}

  async getProductoSucursal(sub_servicioId: string, sucursalId: string): Promise<DatosProducto> {
    const datos = await this.datosProductoRepository
      .createQueryBuilder('dp')
      .where('dp.sub_servicioId = :sub_servicioId', { sub_servicioId })
      .andWhere('dp.sucursalId = :sucursalId', { sucursalId })
      .getOne();
      
    if (!datos) {
      throw new NotFoundException(
        `No se encontraron datos del producto ${sub_servicioId} para la sucursal ${sucursalId}`
      );
    }
    
    return datos;
  }

  async upsertDatosProducto(dto: CreateDatosProductoDto): Promise<DatosProducto> {
    const existing = await this.datosProductoRepository.findOne({
      where: { 
        sub_servicioId: dto.sub_servicioId, 
        sucursalId: dto.sucursalId 
      }
    });
    
    if (existing) {
      Object.assign(existing, dto);
      return await this.datosProductoRepository.save(existing);
    }
    
    const nuevo = this.datosProductoRepository.create(dto);
    return await this.datosProductoRepository.save(nuevo);
  }

  async checkPuntoReorden(sucursalId: string) {
    return await this.datosProductoRepository
      .createQueryBuilder('dp')
      .select([
        'dp.sub_servicioId',
        'dp.punto_reorden',
        'sub_servicio.nombre'
      ])
      .leftJoin('dp.sub_servicio', 'sub_servicio')
      .where('dp.sucursalId = :sucursalId', { sucursalId })
      .andWhere('dp.punto_reorden > 0')
      .getMany();
  }

  async create(createDatosProductoDto: CreateDatosProductoDto): Promise<DatosProducto> {
    return this.upsertDatosProducto(createDatosProductoDto);
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
      throw new NotFoundException(`Datos de producto con ID ${id} no encontrados`);
    }

    return datos;
  }

  async update(id: string, updateDatosProductoDto: UpdateDatosProductoDto): Promise<DatosProducto> {
    const datos = await this.findOne(id);
    Object.assign(datos, updateDatosProductoDto);
    return await this.datosProductoRepository.save(datos);
  }

  async remove(id: string): Promise<void> {
    const datos = await this.findOne(id);
    await this.datosProductoRepository.remove(datos);
  }
}