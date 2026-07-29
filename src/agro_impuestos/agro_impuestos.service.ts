import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgroImpuestoDto } from './dto/create-agro_impuesto.dto';
import { UpdateAgroImpuestoDto } from './dto/update-agro_impuesto.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AgroImpuesto } from './entities/agro_impuesto.entity';
import { Repository } from 'typeorm';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  AccionImpuestos,
  AuditoriaImpuesto,
} from './entities/audit-agro-impuestos.entity';

@Injectable()
export class AgroImpuestosService {
  constructor(
    @InjectRepository(AgroImpuesto)
    private readonly agroImpuestosRepo: Repository<AgroImpuesto>,
    @InjectRepository(AuditoriaImpuesto)
    private readonly auditoriaImpuesto: Repository<AuditoriaImpuesto>,
    private readonly validationAgroservicio: AgroservicioValidationService,
  ) {}
  async create(cliente: Cliente, createAgroImpuestoDto: CreateAgroImpuestoDto) {
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    const impuesto = this.agroImpuestosRepo.create({
      ...createAgroImpuestoDto,
      agroservicio: { id: agroservicioId },
    });
    await this.agroImpuestosRepo.save(impuesto);
    return 'Impuesto creado exitosamente';
  }

  async createEmpleado(
    empleado: EmpleadosAgro,
    createAgroImpuestoDto: CreateAgroImpuestoDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    const impuesto = this.agroImpuestosRepo.create({
      ...createAgroImpuestoDto,
      agroservicio: { id: agroservicioId },
    });
    const impuesto_guardado = await this.agroImpuestosRepo.save(impuesto);

    await this.auditoriaImpuesto.save({
      empleadoId: empleado.id,
      impuestoId: impuesto_guardado.id,
      accion: AccionImpuestos.CREAR,
    });

    return 'Impuesto creado exitosamente';
  }

  async findAllPais(propietarioId: string) {
    try {
      const agroservicio =
        await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
      const agroservicioId = agroservicio.id;
      const impuesto = await this.agroImpuestosRepo.find({
        where: {
          agroservicio: { id: agroservicioId },
        },
        relations: ['agroservicio'],
        order: { nombre: 'ASC' },
      });
      if (!impuesto || impuesto.length === 0) {
        throw new NotFoundException(
          'No se encontraron impuestos disponibles para este pais',
        );
      }
      return impuesto;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const taxe = await this.agroImpuestosRepo.findOne({
      where: { id },
      relations: ['agroservicio'],
    });
    if (!taxe)
      throw new NotFoundException(`No se encontró impuesto con id ${id}`);
    return taxe;
  }

  async update(
    id: string,
    cliente: Cliente,
    updateAgroImpuestoDto: UpdateAgroImpuestoDto,
  ) {
    const propietarioId = cliente.id ?? '';

    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const impuesto = await this.agroImpuestosRepo.findOne({
      where: {
        id,
        agroservicio: {
          id: agroservicio.id,
        },
      },
    });

    if (!impuesto) {
      throw new NotFoundException('El impuesto no existe.');
    }

    Object.assign(impuesto, updateAgroImpuestoDto);

    await this.agroImpuestosRepo.save(impuesto);

    return 'Impuesto actualizado exitosamente';
  }

  async updateEmpleado(
    id: string,
    empleado: EmpleadosAgro,
    updateAgroImpuestoDto: UpdateAgroImpuestoDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';

    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const impuesto = await this.agroImpuestosRepo.findOne({
      where: {
        id,
        agroservicio: {
          id: agroservicio.id,
        },
      },
    });

    if (!impuesto) {
      throw new NotFoundException('El impuesto no existe.');
    }

    Object.assign(impuesto, updateAgroImpuestoDto);

    const impuesto_actualizado = await this.agroImpuestosRepo.save(impuesto);

    await this.auditoriaImpuesto.save({
      empleadoId: empleado.id,
      impuestoId: impuesto_actualizado.id,
      accion: AccionImpuestos.ACTUALIZAR,
    });

    return 'Impuesto actualizado exitosamente';
  }

  remove(id: number) {
    return `This action removes a #${id} agroImpuesto`;
  }
}
