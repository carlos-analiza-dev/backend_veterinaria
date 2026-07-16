import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AgroSucursale } from './entities/agro-sucursale.entity';
import { CreateAgroSucursaleDto } from './dto/create-agro-sucursale.dto';
import { UpdateAgroSucursaleDto } from './dto/update-agro-sucursale.dto';

import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class AgroSucursalesService {
  constructor(
    @InjectRepository(AgroSucursale)
    private readonly sucursalRepo: Repository<AgroSucursale>,

    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,

    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,

    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepo: Repository<MunicipiosDepartamentosPai>,

    @InjectRepository(EmpleadosAgro)
    private readonly empleadoRepo: Repository<EmpleadosAgro>,
    @InjectRepository(DatosAgroservicio)
    private readonly datosAgro: Repository<DatosAgroservicio>,
  ) {}

  async create(cliente: Cliente, createDto: CreateAgroSucursaleDto) {
    const propietarioId = getPropietarioId(cliente);
    const { paisId, departamentoId, municipioId, gerenteId, ...rest } =
      createDto;

    const datoAgro = await this.datosAgro.findOne({ where: { propietarioId } });
    if (!datoAgro)
      throw new NotFoundException(
        'No cuentas con tu agroservicio creado actualmente',
      );

    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });

    if (!pais) {
      throw new NotFoundException('El país seleccionado no existe.');
    }

    const departamento = await this.departamentoRepo.findOne({
      where: { id: departamentoId },
    });

    if (!departamento) {
      throw new NotFoundException('El departamento seleccionado no existe.');
    }

    const municipio = await this.municipioRepo.findOne({
      where: { id: municipioId },
    });

    if (!municipio) {
      throw new NotFoundException('El municipio seleccionado no existe.');
    }

    let gerente: EmpleadosAgro = null;

    if (gerenteId) {
      gerente = await this.empleadoRepo.findOne({
        where: { id: gerenteId },
      });

      if (!gerente) {
        throw new NotFoundException('El gerente seleccionado no existe.');
      }

      const sucursalAsignada = await this.sucursalRepo.findOne({
        where: {
          gerente: {
            id: gerenteId,
          },
        },
        select: ['id', 'nombre'],
      });

      if (sucursalAsignada) {
        throw new BadRequestException(
          `El empleado ya es gerente de la sucursal "${sucursalAsignada.nombre}". No puede ser gerente de dos sucursales al mismo tiempo.`,
        );
      }
    }
    const existeNombre = await this.sucursalRepo.findOne({
      where: {
        nombre: rest.nombre,
      },
    });

    if (existeNombre) {
      throw new BadRequestException('Ya existe una sucursal con ese nombre.');
    }

    const sucursal = this.sucursalRepo.create({
      ...rest,
      pais,
      departamento,
      municipio,
      gerente,
      paisId,
      departamentoId,
      municipioId,
      gerenteId,
      agroservicio: datoAgro,
      creado_por: cliente,
    });

    await this.sucursalRepo.save(sucursal);

    return 'Sucursal Creada Con Exito';
  }

  async findAll(
    cliente: Cliente,
    paginationDto: PaginationDto,
  ): Promise<{
    sucursales: AgroSucursale[];
    total: number;
  }> {
    const { limit = 10, offset = 0 } = paginationDto;
    const propietarioId = getPropietarioId(cliente);

    const query = this.sucursalRepo
      .createQueryBuilder('sucursal')
      .leftJoinAndSelect('sucursal.pais', 'pais')
      .leftJoinAndSelect('sucursal.departamento', 'departamento')
      .leftJoinAndSelect('sucursal.municipio', 'municipio')
      .leftJoinAndSelect('sucursal.gerente', 'gerente')
      .innerJoin('sucursal.agroservicio', 'agroservicio')
      .where('sucursal.isActive = :isActive', { isActive: true })
      .andWhere('agroservicio.propietarioId = :propietarioId', {
        propietarioId,
      })
      .select([
        'sucursal.id',
        'sucursal.nombre',
        'sucursal.tipo',
        'sucursal.latitud',
        'sucursal.longitud',
        'sucursal.direccion_complemento',
        'sucursal.createdAt',

        'pais.id',
        'pais.nombre',

        'departamento.id',
        'departamento.nombre',

        'municipio.id',
        'municipio.nombre',

        'gerente.id',
        'gerente.nombre',
      ])
      .orderBy('sucursal.nombre', 'ASC')
      .skip(offset)
      .take(limit);

    const [sucursales, total] = await query.getManyAndCount();

    return {
      sucursales,
      total,
    };
  }

  async findOne(id: string) {
    const sucursal = await this.sucursalRepo.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!sucursal) {
      throw new NotFoundException('La sucursal no existe.');
    }

    return sucursal;
  }

  async update(id: string, updateDto: UpdateAgroSucursaleDto) {
    const sucursal = await this.findOne(id);

    const { paisId, departamentoId, municipioId, gerenteId, ...rest } =
      updateDto;

    if (paisId) {
      const pais = await this.paisRepo.findOne({
        where: { id: paisId },
      });

      if (!pais) {
        throw new NotFoundException('El país seleccionado no existe.');
      }

      sucursal.pais = pais;
      sucursal.paisId = paisId;
    }

    if (departamentoId) {
      const departamento = await this.departamentoRepo.findOne({
        where: { id: departamentoId },
      });

      if (!departamento) {
        throw new NotFoundException('El departamento seleccionado no existe.');
      }

      sucursal.departamento = departamento;
      sucursal.departamentoId = departamentoId;
    }

    if (municipioId) {
      const municipio = await this.municipioRepo.findOne({
        where: { id: municipioId },
      });

      if (!municipio) {
        throw new NotFoundException('El municipio seleccionado no existe.');
      }

      sucursal.municipio = municipio;
      sucursal.municipioId = municipioId;
    }

    if (gerenteId !== undefined) {
      if (gerenteId) {
        const gerente = await this.empleadoRepo.findOne({
          where: { id: gerenteId },
        });

        if (!gerente) {
          throw new NotFoundException('El gerente seleccionado no existe.');
        }

        const sucursalAsignada = await this.sucursalRepo.findOne({
          where: {
            gerente: {
              id: gerenteId,
            },
          },
          select: ['id', 'nombre'],
          relations: ['gerente'],
        });

        if (sucursalAsignada && sucursalAsignada.id !== sucursal.id) {
          throw new BadRequestException(
            `El empleado ya es gerente de la sucursal "${sucursalAsignada.nombre}". No puede ser gerente de dos sucursales al mismo tiempo.`,
          );
        }

        sucursal.gerente = gerente;
        sucursal.gerenteId = gerenteId;
      } else {
        sucursal.gerente = null;
        sucursal.gerenteId = null;
      }
    }

    Object.assign(sucursal, rest);

    return await this.sucursalRepo.save(sucursal);
  }

  async remove(id: string) {
    const sucursal = await this.findOne(id);

    sucursal.isActive = false;

    await this.sucursalRepo.save(sucursal);

    return {
      message: 'Sucursal eliminada correctamente.',
    };
  }
}
