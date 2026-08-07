import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConsumoAgroInsumoDto } from './dto/create-consumo_agro_insumo.dto';
import { UpdateConsumoAgroInsumoDto } from './dto/update-consumo_agro_insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsumoAgroInsumo } from './entities/consumo_agro_insumo.entity';
import { DataSource, Repository } from 'typeorm';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { InvLoteAgroInsumo } from 'src/compra-insumos/entities/inv-lote-agro-insumo.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import {
  AccionEmpleado,
  AuditoriaEmpleados,
} from 'src/empleados-agro/entities/auditoria_empleados.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Injectable()
export class ConsumoAgroInsumosService {
  constructor(
    @InjectRepository(ConsumoAgroInsumo)
    private readonly consumoInsumoRepo: Repository<ConsumoAgroInsumo>,
    @InjectRepository(AgroInsumos)
    private readonly insumoAgroRepo: Repository<AgroInsumos>,
    @InjectRepository(AgroSucursale)
    private readonly sucursalRepo: Repository<AgroSucursale>,
    @InjectRepository(InvLoteAgroInsumo)
    private readonly lotesAgroInsumos: Repository<InvLoteAgroInsumo>,
    @InjectRepository(AuditoriaEmpleados)
    private readonly auditEmpRepo: Repository<AuditoriaEmpleados>,
    private readonly validationAgro: AgroservicioValidationService,
    private readonly dataSource: DataSource,
  ) {}
  async consumirInsumo(
    sucursalId: string,
    insumoId: string,
    createConsumoDto: CreateConsumoAgroInsumoDto,
  ) {
    const { cantidad, fecha_consumo, observacion } = createConsumoDto;
    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad a consumir debe ser mayor que 0',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const loteRepo = manager.getRepository(InvLoteAgroInsumo);
      const consumoRepo = manager.getRepository(ConsumoAgroInsumo);

      const lotes = await loteRepo
        .createQueryBuilder('lote')
        .where('lote.sucursalId = :sucursalId', {
          sucursalId,
        })
        .andWhere('lote.insumoId = :insumoId', {
          insumoId,
        })
        .andWhere('lote.cantidad > 0')
        .orderBy('lote.created_at', 'ASC')
        .setLock('pessimistic_write')
        .getMany();

      const cantidadDisponible = lotes.reduce(
        (total, lote) => total + Number(lote.cantidad),
        0,
      );

      if (cantidadDisponible < cantidad) {
        throw new BadRequestException(
          `Existencia insuficiente. Disponible: ${cantidadDisponible}`,
        );
      }

      let cantidadPendiente = cantidad;

      const consumos: ConsumoAgroInsumo[] = [];

      for (const lote of lotes) {
        if (cantidadPendiente <= 0) {
          break;
        }

        const cantidadLote = Number(lote.cantidad);

        if (cantidadLote <= 0) {
          continue;
        }

        const cantidadConsumir = Math.min(cantidadLote, cantidadPendiente);

        lote.cantidad = cantidadLote - cantidadConsumir;

        await loteRepo.save(lote);

        const consumo = consumoRepo.create({
          sucursal: { id: sucursalId },
          insumo: { id: insumoId },
          lote: { id: lote.id },
          cantidad: cantidadConsumir,
          fecha_consumo: fecha_consumo,
          observacion,
        });

        const consumoGuardado = await consumoRepo.save(consumo);

        consumos.push(consumoGuardado);

        cantidadPendiente -= cantidadConsumir;
      }

      return 'Se ingreso el consumo de insumo correctamente';
    });
  }

  async consumirInsumoEmpleado(
    empleado: EmpleadosAgro,
    sucursalId: string,
    insumoId: string,
    createConsumoDto: CreateConsumoAgroInsumoDto,
  ) {
    const { cantidad, fecha_consumo, observacion } = createConsumoDto;
    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad a consumir debe ser mayor que 0',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const loteRepo = manager.getRepository(InvLoteAgroInsumo);
      const consumoRepo = manager.getRepository(ConsumoAgroInsumo);
      const insumoRepo = manager.getRepository(AgroInsumos);

      const lotes = await loteRepo
        .createQueryBuilder('lote')
        .where('lote.sucursalId = :sucursalId', {
          sucursalId,
        })
        .andWhere('lote.insumoId = :insumoId', {
          insumoId,
        })
        .andWhere('lote.cantidad > 0')
        .orderBy('lote.created_at', 'ASC')
        .setLock('pessimistic_write')
        .getMany();

      const cantidadDisponible = lotes.reduce(
        (total, lote) => total + Number(lote.cantidad),
        0,
      );

      if (cantidadDisponible < cantidad) {
        throw new BadRequestException(
          `Existencia insuficiente. Disponible: ${cantidadDisponible}`,
        );
      }

      const insumo = await insumoRepo.findOne({
        where: { id: insumoId },
        select: ['id', 'nombre', 'codigo'],
      });

      if (!insumo) {
        throw new NotFoundException('Insumo no encontrado');
      }

      let cantidadPendiente = cantidad;
      const consumos: ConsumoAgroInsumo[] = [];

      for (const lote of lotes) {
        if (cantidadPendiente <= 0) {
          break;
        }

        const cantidadLote = Number(lote.cantidad);

        if (cantidadLote <= 0) {
          continue;
        }

        const cantidadConsumir = Math.min(cantidadLote, cantidadPendiente);

        lote.cantidad = cantidadLote - cantidadConsumir;

        await loteRepo.save(lote);

        const consumo = consumoRepo.create({
          sucursal: { id: sucursalId },
          insumo: { id: insumoId },
          lote: { id: lote.id },
          cantidad: cantidadConsumir,
          fecha_consumo: fecha_consumo,
          observacion,
        });

        const consumoGuardado = await consumoRepo.save(consumo);

        await this.auditEmpRepo.save({
          empleadoId: empleado.id,
          accion: AccionEmpleado.CREAR_CONSUMO_INSUMO,
          descripcion: `El empleado ${empleado.nombre} ingreso un consumo del insumo: ${insumo.nombre} con codigo ${insumo.codigo} y cantidad de ${cantidadConsumir}`,
        });

        consumos.push(consumoGuardado);

        cantidadPendiente -= cantidadConsumir;
      }

      return 'Se ingreso el consumo de insumo correctamente';
    });
  }

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    const { sucursal, limit = 10, offset = 0 } = paginationDto;

    const query = this.consumoInsumoRepo
      .createQueryBuilder('consumo')
      .innerJoinAndSelect('consumo.sucursal', 'sucursal')
      .leftJoinAndSelect('consumo.insumo', 'insumo')
      .leftJoinAndSelect('consumo.lote', 'lote')
      .where('sucursal.agroservicioId = :agroservicioId', {
        agroservicioId,
      });

    if (sucursal && sucursal.trim() !== '') {
      query.andWhere('consumo.sucursalId = :sucursal', {
        sucursal,
      });
    }

    query
      .orderBy('consumo.fecha_consumo', 'DESC')
      .addOrderBy('consumo.created_at', 'DESC')
      .skip(Number(offset))
      .take(Number(limit));

    const [consumos, total] = await query.getManyAndCount();

    return {
      data: consumos,
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} consumoAgroInsumo`;
  }

  update(id: number, updateConsumoAgroInsumoDto: UpdateConsumoAgroInsumoDto) {
    return `This action updates a #${id} consumoAgroInsumo`;
  }

  remove(id: number) {
    return `This action removes a #${id} consumoAgroInsumo`;
  }
}
