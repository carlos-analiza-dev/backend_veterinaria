import { Injectable, NotFoundException } from '@nestjs/common';
import { DescuentosAgroCliente } from './entities/descuentos_clientes_agro.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { CreateDescuentosAgroClienteDto } from './dto/create-descuentos-agro-cliente.dto';
import { UpdateDescuentosAgroClienteDto } from './dto/update-descuentos_cliente.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  AccionEmpleado,
  AuditoriaEmpleados,
} from 'src/empleados-agro/entities/auditoria_empleados.entity';

@Injectable()
export class DescuentosAgroClientesService {
  constructor(
    @InjectRepository(DescuentosAgroCliente)
    private readonly descuentos_repo: Repository<DescuentosAgroCliente>,
    @InjectRepository(AuditoriaEmpleados)
    private readonly auditEmpelado: Repository<AuditoriaEmpleados>,
    private readonly validationAgroservicio: AgroservicioValidationService,
  ) {}

  async create(
    cliente: Cliente,
    createDescuentosPaiDto: CreateDescuentosAgroClienteDto,
  ) {
    const { nombre, porcentaje } = createDescuentosPaiDto;
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const taxe = this.descuentos_repo.create({
      nombre,
      porcentaje,
      agroservicio: { id: agroservicio.id },
    });
    await this.descuentos_repo.save(taxe);

    return {
      message: 'Impuesto creado exitosamente',
      taxe,
    };
  }

  async createEmpleado(
    empleado: EmpleadosAgro,
    createDescuentosPaiDto: CreateDescuentosAgroClienteDto,
  ) {
    const { nombre, porcentaje } = createDescuentosPaiDto;
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const taxe = this.descuentos_repo.create({
      nombre,
      porcentaje,
      agroservicio: { id: agroservicio.id },
    });

    const descuento_guardado = await this.descuentos_repo.save(taxe);

    await this.auditEmpelado.save({
      empleadoId: empleado.id,
      accion: AccionEmpleado.CREAR_DESCUENTO,
      descripcion: `El empleado ${empleado.nombre} creo un nuevo descuento llamado ${descuento_guardado.nombre} para clientes`,
    });

    return 'Descuento creado exitosamente';
  }

  async findAll(propietarioId: string) {
    try {
      const agroservicio =
        await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

      const taxes = await this.descuentos_repo.find({
        where: {
          agroservicio: { id: agroservicio.id },
        },
        relations: ['agroservicio'],
        order: { nombre: 'ASC' },
      });
      if (!taxes || taxes.length === 0) {
        throw new NotFoundException(
          'No se encontraron descuentos disponibles para este agroservicio',
        );
      }
      return taxes;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const taxe = await this.descuentos_repo.findOne({
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
    updateDescuentosDto: UpdateDescuentosAgroClienteDto,
  ) {
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const descuento = await this.descuentos_repo.findOne({
      where: {
        id,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (!descuento) {
      throw new NotFoundException('Descuento no encontrado');
    }

    descuento.nombre = updateDescuentosDto.nombre;
    descuento.porcentaje = updateDescuentosDto.porcentaje;

    await this.descuentos_repo.save(descuento);

    return {
      message: 'Descuento actualizado exitosamente',
      descuento,
    };
  }

  async updateEmpleado(
    id: string,
    empleado: EmpleadosAgro,
    updateDescuentosDto: UpdateDescuentosAgroClienteDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const descuento = await this.descuentos_repo.findOne({
      where: {
        id,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (!descuento) {
      throw new NotFoundException('Descuento no encontrado');
    }

    descuento.nombre = updateDescuentosDto.nombre;
    descuento.porcentaje = updateDescuentosDto.porcentaje;

    const descuento_actualizado = await this.descuentos_repo.save(descuento);

    await this.auditEmpelado.save({
      empleadoId: empleado.id,
      accion: AccionEmpleado.ACTUALIZAR_DESCUENTO,
      descripcion: `El empleado ${empleado.nombre} actualizo el descuento llamado ${descuento_actualizado.nombre} para clientes`,
    });

    return {
      message: 'Descuento actualizado exitosamente',
      descuento,
    };
  }
}
