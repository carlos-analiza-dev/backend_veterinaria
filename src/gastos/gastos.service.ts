import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Gasto } from './entities/gasto.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { CategoriaGasto, MetodoPago } from 'src/interfaces/gastos.enums';
import { instanceToPlain } from 'class-transformer';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { getPropietarioId } from 'src/utils/get-propietario-id';

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private gastoRepository: Repository<Gasto>,
    @InjectRepository(FincasGanadero)
    private fincaRepository: Repository<FincasGanadero>,
    @InjectRepository(EspecieAnimal)
    private especieRepository: Repository<EspecieAnimal>,
    @InjectRepository(RazaAnimal)
    private razaRepository: Repository<RazaAnimal>,
    @InjectRepository(Cliente)
    private userRepository: Repository<Cliente>,
  ) {}
  async create(createGastoDto: CreateGastoDto, cliente: Cliente) {
    const userId = getPropietarioId(cliente);
    try {
      const { fincaId, especieId, razaId, ...rest } = createGastoDto;

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

      const gasto = this.gastoRepository.create({
        ...rest,
        finca,
        especie,
        raza,
        registradoPorId: cliente.id,
      });

      const gastoGuardado = await this.gastoRepository.save(gasto);
      return this.mapToResponseDto(gastoGuardado);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el gasto');
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

    const where: FindOptionsWhere<Gasto> = {};

    if (fincaId && fincaId !== '') {
      where.finca = { id: fincaId };
    }

    if (especieId && especieId !== '') {
      where.especie = { id: especieId };
    }

    if (categoria && categoria !== '') {
      where.categoria = categoria as CategoriaGasto;
    }

    if (metodo_pago && metodo_pago !== '') {
      where.metodo_pago = metodo_pago as MetodoPago;
    }

    if (fechaInicio && fechaFin) {
      where.fecha_gasto = Between(new Date(fechaInicio), new Date(fechaFin));
    } else if (fechaInicio) {
      where.fecha_gasto = Between(new Date(fechaInicio), new Date());
    } else if (fechaFin) {
      where.fecha_gasto = Between(new Date('2000-01-01'), new Date(fechaFin));
    }

    const total = await this.gastoRepository.count({ where });

    const gastos = await this.gastoRepository.find({
      where,
      relations: ['finca', 'especie', 'raza', 'registradoPor'],
      order: { fecha_gasto: 'DESC', createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: gastos.map((gasto) => this.mapToResponseDto(gasto)),
      total,
      limit,
      offset,
      totalPages,
    };
  }

  async findOne(id: string) {
    const gasto = await this.gastoRepository.findOne({
      where: { id },
      relations: ['finca', 'especie', 'raza', 'registradoPor'],
    });
    if (!gasto) throw new NotFoundException('No se encontro el gasto asociado');
    const gasto_data = this.mapToResponseDto(gasto);
    return instanceToPlain(gasto_data);
  }

  async update(id: string, updateGastoDto: UpdateGastoDto, cliente: Cliente) {
    try {
      const gasto = await this.gastoRepository.findOne({
        where: { id },
        relations: ['finca', 'especie', 'raza', 'registradoPor'],
      });

      if (!gasto) {
        throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
      }

      const { fincaId, especieId, razaId, ...rest } = updateGastoDto;

      if (fincaId) {
        const finca = await this.fincaRepository.findOne({
          where: { id: fincaId, propietario: { id: cliente.id } },
        });
        if (!finca) {
          throw new NotFoundException(
            `Finca con ID ${fincaId} no encontrada o no te pertenece`,
          );
        }
        gasto.finca = finca;
      } else if (fincaId === null || fincaId === undefined) {
        gasto.finca = null;
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
          gasto.especie = especie;
        } else {
          gasto.especie = null;
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
          gasto.raza = raza;
        } else {
          gasto.raza = null;
        }
      }

      if (rest.categoria !== undefined) {
        gasto.categoria = rest.categoria;
      }

      if (rest.concepto !== undefined) {
        if (rest.concepto.length > 200) {
          throw new BadRequestException(
            'El concepto no puede exceder los 200 caracteres',
          );
        }
        gasto.concepto = rest.concepto;
      }

      if (rest.descripcion !== undefined) {
        if (rest.descripcion && rest.descripcion.length > 500) {
          throw new BadRequestException(
            'La descripción no puede exceder los 500 caracteres',
          );
        }
        gasto.descripcion = rest.descripcion;
      }

      if (rest.monto !== undefined) {
        if (rest.monto <= 0) {
          throw new BadRequestException('El monto debe ser mayor a 0');
        }
        gasto.monto = rest.monto;
      }

      if (rest.fecha_gasto !== undefined) {
        const fecha = rest.fecha_gasto;

        gasto.fecha_gasto = fecha;
      }

      if (rest.metodo_pago !== undefined) {
        gasto.metodo_pago = rest.metodo_pago;
      }

      if (rest.notas !== undefined) {
        if (rest.notas && rest.notas.length > 500) {
          throw new BadRequestException(
            'Las notas no pueden exceder los 500 caracteres',
          );
        }
        gasto.notas = rest.notas;
      }

      const gastoActualizado = await this.gastoRepository.save({
        ...gasto,
        actualizadoPorId: cliente.id,
      });
      return this.mapToResponseDto(gastoActualizado);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el gasto');
    }
  }

  private mapToResponseDto(gasto: Gasto) {
    return {
      id: gasto.id,
      categoria: gasto.categoria,
      fincaId: gasto.finca?.id,
      fincaNombre: gasto.finca?.nombre_finca,
      especieId: gasto.especie?.id,
      especieNombre: gasto.especie?.nombre,
      razaId: gasto.raza?.id,
      razaNombre: gasto.raza?.nombre,
      concepto: gasto.concepto,
      descripcion: gasto.descripcion,
      monto: Number(gasto.monto),
      fecha_gasto: gasto.fecha_gasto,
      metodo_pago: gasto.metodo_pago,
      registradoPorId: gasto.registradoPorId,
      registradoPorNombre: gasto.registradoPor?.nombre,
      notas: gasto.notas,
      createdAt: gasto.createdAt,
      updatedAt: gasto.updatedAt,
    };
  }
}
