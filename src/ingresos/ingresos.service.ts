import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { CategoriaIngreso } from 'src/interfaces/ingresos.enums';
import { MetodoPago } from 'src/interfaces/gastos.enums';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepo: Repository<Ingreso>,
    @InjectRepository(FincasGanadero)
    private fincaRepository: Repository<FincasGanadero>,
    @InjectRepository(EspecieAnimal)
    private especieRepository: Repository<EspecieAnimal>,
    @InjectRepository(RazaAnimal)
    private razaRepository: Repository<RazaAnimal>,
    @InjectRepository(Cliente)
    private userRepository: Repository<Cliente>,
  ) {}
  async create(createIngresoDto: CreateIngresoDto, cliente: Cliente) {
    const userId = cliente.id ?? '';
    try {
      const { fincaId, especieId, razaId, ...rest } = createIngresoDto;

      let finca = null;
      let especie = null;
      let raza = null;

      if (fincaId) {
        finca = await this.fincaRepository.findOne({ where: { id: fincaId } });
        if (!finca) {
          throw new NotFoundException(`Finca con ID ${fincaId} no encontrada`);
        }
      }

      if (especieId) {
        especie = await this.especieRepository.findOne({
          where: { id: especieId },
        });
        if (!especie) {
          throw new NotFoundException(
            `Especie con ID ${especieId} no encontrada`,
          );
        }
      }

      if (razaId) {
        raza = await this.razaRepository.findOne({ where: { id: razaId } });
        if (!raza) {
          throw new NotFoundException(`Raza con ID ${razaId} no encontrada`);
        }
      }

      const usuario = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }

      const ingreso = this.ingresoRepo.create({
        ...rest,
        finca,
        especie,
        raza,
        registradoPor: usuario,
        registradoPorId: userId,
      });

      const ingresoGuardado = await this.ingresoRepo.save(ingreso);
      return this.mapToResponseDto(ingresoGuardado);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el ingreso');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      fincaId = '',
      especieId = '',
      categoria = '',
      metodo_pago = '',
      fechaInicio,
      fechaFin,
    } = paginationDto;

    const where: FindOptionsWhere<Ingreso> = {};

    if (fincaId && fincaId !== '') {
      where.finca = { id: fincaId };
    }

    if (especieId && especieId !== '') {
      where.especie = { id: especieId };
    }

    if (categoria && categoria !== '') {
      where.categoria = categoria as CategoriaIngreso;
    }

    if (metodo_pago && metodo_pago !== '') {
      where.metodo_pago = metodo_pago as MetodoPago;
    }

    if (fechaInicio && fechaFin) {
      where.fecha_ingreso = Between(new Date(fechaInicio), new Date(fechaFin));
    } else if (fechaInicio) {
      where.fecha_ingreso = Between(new Date(fechaInicio), new Date());
    } else if (fechaFin) {
      where.fecha_ingreso = Between(new Date('2000-01-01'), new Date(fechaFin));
    }

    const total = await this.ingresoRepo.count({ where });

    const ingresos = await this.ingresoRepo.find({
      where,
      relations: ['finca', 'especie', 'raza', 'registradoPor'],
      order: { fecha_ingreso: 'DESC', createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: ingresos.map((ingreso) => this.mapToResponseDto(ingreso)),
      total,
      limit,
      offset,
      totalPages,
    };
  }

  async findOne(id: string) {
    const ingreso = await this.ingresoRepo.findOne({
      where: { id },
      relations: ['finca', 'especie', 'raza', 'registradoPor'],
    });
    if (!ingreso)
      throw new NotFoundException('No se encontro el ingreso asociado');
    const ingreso_data = this.mapToResponseDto(ingreso);
    return instanceToPlain(ingreso_data);
  }

  async update(
    id: string,
    updateIngresoDto: UpdateIngresoDto,
    cliente: Cliente,
  ) {
    try {
      const ingreso = await this.ingresoRepo.findOne({
        where: { id },
        relations: ['finca', 'especie', 'raza', 'registradoPor'],
      });

      if (!ingreso) {
        throw new NotFoundException(`Ingreso con ID ${id} no encontrado`);
      }

      if (ingreso.registradoPorId !== cliente.id) {
        throw new BadRequestException(
          'No tienes permiso para editar este ingreso',
        );
      }

      const { fincaId, especieId, razaId, ...rest } = updateIngresoDto;

      if (fincaId) {
        const finca = await this.fincaRepository.findOne({
          where: { id: fincaId, propietario: { id: cliente.id } },
        });
        if (!finca) {
          throw new NotFoundException(
            `Finca con ID ${fincaId} no encontrada o no te pertenece`,
          );
        }
        ingreso.finca = finca;
      } else if (fincaId === null || fincaId === undefined) {
        ingreso.finca = null;
      }

      if (especieId !== undefined) {
        if (especieId) {
          const especie = await this.especieRepository.findOne({
            where: { id: especieId },
          });
          if (!especie) {
            throw new NotFoundException(
              `Especie con ID ${especieId} no encontrada`,
            );
          }
          ingreso.especie = especie;
        } else {
          ingreso.especie = null;
        }
      }

      if (razaId !== undefined) {
        if (razaId) {
          const raza = await this.razaRepository.findOne({
            where: { id: razaId },
            relations: ['especie'],
          });
          if (!raza) {
            throw new NotFoundException(`Raza con ID ${razaId} no encontrada`);
          }

          if (especieId && raza.especie.id !== especieId) {
            throw new BadRequestException(
              'La raza seleccionada no pertenece a la especie especificada',
            );
          }
          ingreso.raza = raza;
        } else {
          ingreso.raza = null;
        }
      }

      if (rest.categoria !== undefined) {
        ingreso.categoria = rest.categoria;
      }

      if (rest.concepto !== undefined) {
        if (rest.concepto.length > 200) {
          throw new BadRequestException(
            'El concepto no puede exceder los 200 caracteres',
          );
        }
        ingreso.concepto = rest.concepto;
      }

      if (rest.descripcion !== undefined) {
        if (rest.descripcion && rest.descripcion.length > 500) {
          throw new BadRequestException(
            'La descripción no puede exceder los 500 caracteres',
          );
        }
        ingreso.descripcion = rest.descripcion;
      }

      if (rest.monto !== undefined) {
        if (rest.monto <= 0) {
          throw new BadRequestException('El monto debe ser mayor a 0');
        }
        ingreso.monto = rest.monto;
      }

      if (rest.fecha_ingreso !== undefined) {
        const fecha = rest.fecha_ingreso;

        ingreso.fecha_ingreso = fecha;
      }

      if (rest.metodo_pago !== undefined) {
        ingreso.metodo_pago = rest.metodo_pago;
      }

      if (rest.notas !== undefined) {
        if (rest.notas && rest.notas.length > 500) {
          throw new BadRequestException(
            'Las notas no pueden exceder los 500 caracteres',
          );
        }
        ingreso.notas = rest.notas;
      }

      const ingresoActualizado = await this.ingresoRepo.save(ingreso);
      return this.mapToResponseDto(ingresoActualizado);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el ingreso');
    }
  }

  private mapToResponseDto(ingreso: Ingreso) {
    return {
      id: ingreso.id,
      categoria: ingreso.categoria,
      fincaId: ingreso.finca?.id,
      fincaNombre: ingreso.finca?.nombre_finca,
      especieId: ingreso.especie?.id,
      especieNombre: ingreso.especie?.nombre,
      razaId: ingreso.raza?.id,
      razaNombre: ingreso.raza?.nombre,
      concepto: ingreso.concepto,
      descripcion: ingreso.descripcion,
      monto: Number(ingreso.monto),
      fecha_ingreso: ingreso.fecha_ingreso,
      metodo_pago: ingreso.metodo_pago,
      registradoPorId: ingreso.registradoPorId,
      registradoPorNombre: ingreso.registradoPor?.nombre,
      notas: ingreso.notas,
      createdAt: ingreso.createdAt,
      updatedAt: ingreso.updatedAt,
    };
  }
}
