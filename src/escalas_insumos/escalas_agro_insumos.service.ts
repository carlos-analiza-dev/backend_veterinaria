import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EscalasAgroInsumo } from './entities/escalas_agro_insumos.entity';
import { Repository } from 'typeorm';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { UpdateEscalasAgroInsumoDto } from './dto/update-escalas_insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { CreateEscalasAgroInsumoDto } from './dto/create-escalas_agro_insumo.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  AccionEmpleado,
  AuditoriaEmpleados,
} from 'src/empleados-agro/entities/auditoria_empleados.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Injectable()
export class EscalasAgroInsumosService {
  constructor(
    @InjectRepository(EscalasAgroInsumo)
    private readonly escalasRepo: Repository<EscalasAgroInsumo>,
    @InjectRepository(AgroInsumos)
    private readonly insumoRepo: Repository<AgroInsumos>,
    @InjectRepository(AgroProveedore)
    private readonly proveedorRepository: Repository<AgroProveedore>,
    @InjectRepository(AuditoriaEmpleados)
    private readonly auditEmpRepo: Repository<AuditoriaEmpleados>,
    private readonly validationAgroservicio: AgroservicioValidationService,
  ) {}

  async create(
    cliente: Cliente,
    createEscalasInsumoDto: CreateEscalasAgroInsumoDto,
  ) {
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;
    const {
      cantidad_comprada,
      costo,
      bonificacion,
      insumoId,
      proveedorId,
      isActive,
    } = createEscalasInsumoDto;
    try {
      const insumo_existe = await this.insumoRepo.findOne({
        where: { id: insumoId },
      });
      if (!insumo_existe)
        throw new NotFoundException('No se encontro el insumo seleccionado');

      const proveedor_existe = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_existe)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const escala = this.escalasRepo.create({
        cantidad_comprada,
        bonificacion,
        costo,
        isActive,
        agroservicio: { id: agroservicioId },
        insumo: insumo_existe,
        proveedor: proveedor_existe,
      });
      await this.escalasRepo.save(escala);
      return 'Escala del insumo creada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async createEmpleado(
    empleado: EmpleadosAgro,
    createEscalasInsumoDto: CreateEscalasAgroInsumoDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;
    const {
      cantidad_comprada,
      costo,
      bonificacion,
      insumoId,
      proveedorId,
      isActive,
    } = createEscalasInsumoDto;
    try {
      const insumo_existe = await this.insumoRepo.findOne({
        where: { id: insumoId },
      });
      if (!insumo_existe)
        throw new NotFoundException('No se encontro el insumo seleccionado');

      const proveedor_existe = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_existe)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const escala = this.escalasRepo.create({
        cantidad_comprada,
        bonificacion,
        costo,
        isActive,
        agroservicio: { id: agroservicioId },
        insumo: insumo_existe,
        proveedor: proveedor_existe,
      });
      const escala_guardada = await this.escalasRepo.save(escala);
      await this.auditEmpRepo.save({
        empleadoId: empleado.id,
        accion: AccionEmpleado.CREAR_ESCALA,
        descripcion: `El empleado ${empleado.nombre} ingreso una nueva escala para el insumo ${escala_guardada.insumo.nombre} del proveedor ${escala_guardada.proveedor.nombre_legal}`,
      });
      return 'Escala del insumo creada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const escalas = await this.escalasRepo.find({
        relations: ['insumo'],
        order: { cantidad_comprada: 'ASC' },
      });
      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async findByInsumo(paginationDto: PaginationDto, insumoId: string) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const [escalas, total] = await this.escalasRepo.findAndCount({
        where: { insumo: { id: insumoId } },
        relations: ['insumo', 'proveedor', 'agroservicio'],
        order: { cantidad_comprada: 'ASC' },
        take: limit,
        skip: offset,
      });

      if (!escalas || escalas.length === 0) {
        throw new NotFoundException(
          `No se encontraron escalas para el insumo con ID ${insumoId}`,
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

  async findByProveedorAndInsumo(proveedorId: string, insumoId: string) {
    try {
      const [proveedor, insumo] = await Promise.all([
        this.proveedorRepository.findOne({ where: { id: proveedorId } }),
        this.insumoRepo.findOne({ where: { id: insumoId } }),
      ]);

      if (!proveedor) {
        throw new NotFoundException('No se encontró el proveedor seleccionado');
      }

      if (!insumo) {
        throw new NotFoundException('No se encontró el insumo seleccionado');
      }

      const escalas = await this.escalasRepo.find({
        where: {
          proveedor: { id: proveedorId },
          insumo: { id: insumoId },
          isActive: true,
        },
        relations: ['insumo', 'proveedor', 'agroservicio'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (escalas.length === 0) {
        throw new NotFoundException(
          'No se encontraron escalas para esta combinación de proveedor e insumo',
        );
      }

      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async findByInsumoEscalas(insumoId: string) {
    try {
      const escalas = await this.escalasRepo.find({
        where: { insumo: { id: insumoId } },
        relations: ['insumo', 'proveedor', 'agroservicio'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (!escalas || escalas.length === 0) {
        throw new NotFoundException(
          `No se encontraron escalas para el insumo con ID ${insumoId}`,
        );
      }

      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateEscalasInsumoDto: UpdateEscalasAgroInsumoDto) {
    try {
      const escala = await this.escalasRepo.findOne({
        where: { id },
      });

      if (!escala) {
        throw new NotFoundException(`Escala con ID ${id} no encontrada`);
      }

      if (updateEscalasInsumoDto.insumoId) {
        const insumo_existe = await this.insumoRepo.findOne({
          where: { id: updateEscalasInsumoDto.insumoId },
        });
        if (!insumo_existe) {
          throw new NotFoundException('No se encontró el insumo seleccionado');
        }
      }

      await this.escalasRepo.update(id, updateEscalasInsumoDto);

      const escalaActualizada = await this.escalasRepo.findOne({
        where: { id },
        relations: ['insumo'],
      });

      return {
        message: 'Escala actualizada exitosamente',
        data: escalaActualizada,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmpleado(
    id: string,
    empleado: EmpleadosAgro,
    updateEscalasInsumoDto: UpdateEscalasAgroInsumoDto,
  ) {
    try {
      const escala = await this.escalasRepo.findOne({
        where: { id },
      });

      if (!escala) {
        throw new NotFoundException(`Escala con ID ${id} no encontrada`);
      }

      if (updateEscalasInsumoDto.insumoId) {
        const insumo_existe = await this.insumoRepo.findOne({
          where: { id: updateEscalasInsumoDto.insumoId },
        });
        if (!insumo_existe) {
          throw new NotFoundException('No se encontró el insumo seleccionado');
        }
      }

      await this.escalasRepo.update(id, updateEscalasInsumoDto);

      const escalaActualizada = await this.escalasRepo.findOne({
        where: { id },
        relations: ['insumo'],
      });

      await this.auditEmpRepo.save({
        empleadoId: empleado.id,
        accion: AccionEmpleado.ACTUALIZAR_ESCALA,
        descripcion: `El empleado ${empleado.nombre} ha actualizado la escala del insum ${escalaActualizada.insumo.nombre} del proveedor ${escalaActualizada.proveedor.nombre_legal}`,
      });

      return {
        message: 'Escala actualizada exitosamente',
        data: escalaActualizada,
      };
    } catch (error) {
      throw error;
    }
  }
}
