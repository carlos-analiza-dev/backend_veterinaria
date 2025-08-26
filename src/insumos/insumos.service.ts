import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { instanceToPlain } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class InsumosService {
  constructor(
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
    @InjectRepository(Proveedor)
    private readonly repoProveedor: Repository<Proveedor>,
    @InjectRepository(Marca)
    private readonly repoMarca: Repository<Marca>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
  ) {}

  async create(createInsumoDto: CreateInsumoDto) {
    const {
      costo,
      nombre,
      unidad_venta,

      disponible,
      proveedorId,
      paisId,
      marcaId,
      codigo,
    } = createInsumoDto;
    try {
      const marca_exist = await this.repoMarca.findOne({
        where: { id: marcaId },
      });
      if (!marca_exist)
        throw new NotFoundException('No se encontro la marca seleccionada');

      const proveedor_exist = await this.repoProveedor.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_exist)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const pais_exist = await this.paisRepo.findOne({
        where: { id: paisId },
      });
      if (!pais_exist)
        throw new NotFoundException('No se encontro el pais seleccionado');

      const insumo_exist_codigo = await this.insumoRepository.findOne({
        where: { codigo: codigo },
      });
      if (insumo_exist_codigo)
        throw new ConflictException('Ya existe un insumo con este codigo');

      const insumo = this.insumoRepository.create({
        codigo,
        costo,
        disponible,
        marca: marca_exist,
        proveedor: proveedor_exist,
        pais: pais_exist,
        nombre,

        unidad_venta,
      });
      await this.insumoRepository.save(insumo);

      return 'Insumo creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, pais } = paginationDto;

    const queryBuilder = this.insumoRepository
      .createQueryBuilder('insumo')
      .leftJoinAndSelect('insumo.marca', 'marca')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .leftJoinAndSelect('insumo.pais', 'pais')
      .leftJoinAndSelect('insumo.inventario', 'inventario')
      .orderBy('insumo.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (pais) {
      queryBuilder.andWhere('pais.id = :paisId', { paisId: pais });
    }

    const [insumos, total] = await queryBuilder.getManyAndCount();

    return {
      data: instanceToPlain(insumos),
      total,
    };
  }

  async findInsumosDisponibles() {
    try {
      const insumos_disponibles = await this.insumoRepository.find({
        where: { disponible: true },
      });
      if (!insumos_disponibles || insumos_disponibles.length === 0) {
        throw new NotFoundException(
          'No se encontraron insumos disponibles en este momento',
        );
      }
      return { insumos: instanceToPlain(insumos_disponibles) };
    } catch (error) {
      throw error;
    }
  }

  async findInsumosSinInventario(user: User) {
    const paisId = user.pais.id;

    const insumos = await this.insumoRepository
      .createQueryBuilder('insumo')
      .leftJoin('insumo.inventario', 'inventario')
      .where('inventario.id IS NULL')
      .andWhere('insumo.pais_id = :paisId', { paisId })
      .getMany();

    if (!insumos || insumos.length === 0) {
      throw new NotFoundException(
        'No se encontraron insumos sin inventario en este país',
      );
    }

    return insumos;
  }

  async findOne(id: string) {
    const insumo = await this.insumoRepository.findOneBy({ id });
    if (!insumo)
      throw new NotFoundException(`insumo con ID ${id} no encontrado`);
    return insumo;
  }

  async update(id: string, updateInsumoDto: UpdateInsumoDto) {
    try {
      const insumo = await this.findOne(id);

      if (updateInsumoDto.costo !== undefined && updateInsumoDto.costo <= 0) {
        throw new BadRequestException('El costo debe ser mayor a 0');
      }

      if (updateInsumoDto.paisId) {
        const pais = await this.paisRepo.findOne({
          where: { id: updateInsumoDto.paisId },
        });
        if (!pais) {
          throw new NotFoundException('Pais no encontrada o inactiva');
        }
        insumo.pais = pais;
      }

      if (updateInsumoDto.marcaId) {
        const marca = await this.repoMarca.findOne({
          where: { id: updateInsumoDto.marcaId, is_active: true },
        });
        if (!marca) {
          throw new NotFoundException('Marca no encontrada o inactiva');
        }
        insumo.marca = marca;
      }

      if (updateInsumoDto.proveedorId) {
        const proveedor = await this.repoProveedor.findOne({
          where: { id: updateInsumoDto.proveedorId, is_active: true },
        });
        if (!proveedor) {
          throw new NotFoundException('Proveedor no encontrado o inactivo');
        }
        insumo.proveedor = proveedor;
      }

      const camposActualizables = [
        'nombre',
        'tipo',
        'unidad_venta',
        'descripcion',
        'costo',
        'disponible',
      ];

      camposActualizables.forEach((campo) => {
        if (updateInsumoDto[campo] !== undefined) {
          insumo[campo] = updateInsumoDto[campo];
        }
      });

      if (updateInsumoDto.unidad_venta) {
        insumo.unidad_venta = updateInsumoDto.unidad_venta;
      }

      const insumoActualizado = await this.insumoRepository.save(insumo);

      return {
        message: 'Insumo actualizado exitosamente',
        data: insumoActualizado,
      };
    } catch (error) {
      throw error;
    }
  }
}
