import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CompraAgroInsumo } from './entities/compra-agro-insumo.entity';
import { DetalleCompraAgroInsumo } from './entities/detalle-compra-agro-insumo.entity';
import { InvLoteAgroInsumo } from './entities/inv-lote-agro-insumo.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import { CreateCompraAgroInsumoDto } from './dto/create-compra-agro-insumo.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import {
  AccionEmpleado,
  AuditoriaEmpleados,
} from 'src/empleados-agro/entities/auditoria_empleados.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CompraAgroInsumosService {
  constructor(
    @InjectRepository(CompraAgroInsumo)
    private readonly compraInsumoRepository: Repository<CompraAgroInsumo>,
    @InjectRepository(DetalleCompraAgroInsumo)
    private readonly detalleCompraInsumoRepository: Repository<DetalleCompraAgroInsumo>,
    @InjectRepository(InvLoteAgroInsumo)
    private readonly invLoteInsumoRepository: Repository<InvLoteAgroInsumo>,
    @InjectRepository(AgroSucursale)
    private readonly sucursalRepository: Repository<AgroSucursale>,
    @InjectRepository(AgroProveedore)
    private readonly proveedorRepository: Repository<AgroProveedore>,
    @InjectRepository(AgroInsumos)
    private readonly insumoRepository: Repository<AgroInsumos>,
    @InjectRepository(AuditoriaEmpleados)
    private readonly auditEmpRepo: Repository<AuditoriaEmpleados>,

    private readonly validationAgroservicio: AgroservicioValidationService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createCompraInsumoDto: CreateCompraAgroInsumoDto,
    cliente: Cliente,
  ) {
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proveedor_exist = await this.proveedorRepository.findOne({
        where: { id: createCompraInsumoDto.proveedorId },
      });
      if (!proveedor_exist)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const sucursal_exist = await this.sucursalRepository.findOne({
        where: { id: createCompraInsumoDto.sucursalId },
      });
      if (!sucursal_exist)
        throw new NotFoundException('No se encontro la sucursal seleccionado');

      const insumosIds = createCompraInsumoDto.detalles.map((d) => d.insumoId);
      const insumosUnicos = new Set(insumosIds);
      if (insumosIds.length !== insumosUnicos.size) {
        throw new BadRequestException('Insumos duplicados en los detalles');
      }

      for (const insumoId of insumosIds) {
        const insumo = await this.insumoRepository.findOne({
          where: { id: insumoId },
        });
        if (!insumo) {
          throw new BadRequestException(
            `Insumo con ID ${insumoId} no encontrado`,
          );
        }
      }

      const compra = this.compraInsumoRepository.create({
        ...createCompraInsumoDto,
        agroservicio: { id: agroservicio.id },
        numero_factura: createCompraInsumoDto.numero_factura,
      });

      const compraGuardada = await queryRunner.manager.save(
        CompraAgroInsumo,
        compra,
      );

      for (const detalle of createCompraInsumoDto.detalles) {
        const detalleEntity = this.detalleCompraInsumoRepository.create({
          ...detalle,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalleEntity);

        const cantidadTotal = detalle.cantidad + (detalle.bonificacion || 0);

        const costoRealPorUnidad = detalle.monto_total / cantidadTotal;

        const lote = this.invLoteInsumoRepository.create({
          insumo: { id: detalle.insumoId },
          cantidad: cantidadTotal,
          costo: detalle.monto_total,
          costo_por_unidad: costoRealPorUnidad,
          compra: { id: compraGuardada.id },
          sucursal: { id: createCompraInsumoDto.sucursalId },
        });
        await queryRunner.manager.save(lote);
      }

      await queryRunner.commitTransaction();
      return 'Compra ingresada con exito';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createEmpleado(
    createCompraInsumoDto: CreateCompraAgroInsumoDto,
    empleado: EmpleadosAgro,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proveedor_exist = await this.proveedorRepository.findOne({
        where: { id: createCompraInsumoDto.proveedorId },
      });
      if (!proveedor_exist)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const sucursal_exist = await this.sucursalRepository.findOne({
        where: { id: createCompraInsumoDto.sucursalId },
      });
      if (!sucursal_exist)
        throw new NotFoundException('No se encontro la sucursal seleccionado');

      const insumosIds = createCompraInsumoDto.detalles.map((d) => d.insumoId);
      const insumosUnicos = new Set(insumosIds);
      if (insumosIds.length !== insumosUnicos.size) {
        throw new BadRequestException('Insumos duplicados en los detalles');
      }

      for (const insumoId of insumosIds) {
        const insumo = await this.insumoRepository.findOne({
          where: { id: insumoId },
        });
        if (!insumo) {
          throw new BadRequestException(
            `Insumo con ID ${insumoId} no encontrado`,
          );
        }
      }

      const compra = this.compraInsumoRepository.create({
        ...createCompraInsumoDto,
        agroservicio: { id: agroservicio.id },
        numero_factura: createCompraInsumoDto.numero_factura,
      });

      const compraGuardada = await queryRunner.manager.save(
        CompraAgroInsumo,
        compra,
      );

      for (const detalle of createCompraInsumoDto.detalles) {
        const detalleEntity = this.detalleCompraInsumoRepository.create({
          ...detalle,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalleEntity);

        const cantidadTotal = detalle.cantidad + (detalle.bonificacion || 0);

        const costoRealPorUnidad = detalle.monto_total / cantidadTotal;

        const lote = this.invLoteInsumoRepository.create({
          insumo: { id: detalle.insumoId },
          cantidad: cantidadTotal,
          costo: detalle.monto_total,
          costo_por_unidad: costoRealPorUnidad,
          compra: { id: compraGuardada.id },
          sucursal: { id: createCompraInsumoDto.sucursalId },
        });
        await queryRunner.manager.save(lote);
      }

      const auditoria = this.auditEmpRepo.create({
        descripcion: `El empleado creó la compra de insumos con factura No. ${compraGuardada.numero_factura}`,
        accion: AccionEmpleado.CREAR_COMPRA_INSUMO,
        empleadoId: empleado.id,
      });

      await queryRunner.manager.save(AuditoriaEmpleados, auditoria);

      await queryRunner.commitTransaction();
      return 'Compra ingresada con exito';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;
    const {
      limit = 10,
      offset = 0,
      proveedor = '',
      sucursal = '',
      tipoPago = '',
    } = paginationDto;

    try {
      const queryBuilder = this.compraInsumoRepository
        .createQueryBuilder('compra')
        .leftJoinAndSelect('compra.detalles', 'detalles')
        .leftJoinAndSelect('detalles.insumo', 'insumo')
        .leftJoinAndSelect('compra.lotes', 'lotes')
        .leftJoinAndSelect('compra.proveedor', 'proveedor')
        .leftJoinAndSelect('compra.sucursal', 'sucursal')
        .leftJoinAndSelect('compra.agroservicio', 'agroservicio')
        .orderBy('compra.created_at', 'DESC');

      queryBuilder.andWhere('compra.agroservicioId = :agroservicioId', {
        agroservicioId,
      });

      if (proveedor && proveedor.trim() !== '') {
        queryBuilder.andWhere(
          '(proveedor.id = :proveedorId OR proveedor.nombre_legal ILIKE :proveedorNombre)',
          {
            proveedorId: proveedor,
            proveedorNombre: `%${proveedor}%`,
          },
        );
      }

      if (sucursal && sucursal.trim() !== '') {
        queryBuilder.andWhere(
          '(sucursal.id = :sucursalId OR sucursal.nombre ILIKE :sucursalNombre)',
          {
            sucursalId: sucursal,
            sucursalNombre: `%${sucursal}%`,
          },
        );
      }

      if (tipoPago && tipoPago.trim() !== '') {
        queryBuilder.andWhere('compra.tipo_pago = :tipoPago', {
          tipoPago: tipoPago.toUpperCase(),
        });
      }

      if (limit !== undefined) queryBuilder.take(limit);
      if (offset !== undefined) queryBuilder.skip(offset);

      const [compras, total] = await queryBuilder.getManyAndCount();

      if (!compras || compras.length === 0) {
        let errorMessage = 'No se encontraron compras';
        const filters = [];

        if (proveedor) filters.push(`proveedor: ${proveedor}`);
        if (sucursal) filters.push(`sucursal: ${sucursal}`);
        if (tipoPago) filters.push(`tipo de pago: ${tipoPago}`);

        if (filters.length > 0) {
          errorMessage += ` con los filtros: ${filters.join(', ')}`;
        }

        throw new BadRequestException(errorMessage);
      }

      return {
        compras: instanceToPlain(compras),
        total,
      };
    } catch (error) {
      throw error;
    }
  }
}
