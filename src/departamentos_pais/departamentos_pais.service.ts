import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartamentosPaiDto } from './dto/create-departamentos_pai.dto';
import { UpdateDepartamentosPaiDto } from './dto/update-departamentos_pai.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartamentosPai } from './entities/departamentos_pai.entity';
import { Repository } from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class DepartamentosPaisService {
  constructor(
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
  ) {}

  async create(createDepartamentosPaiDto: CreateDepartamentosPaiDto) {
    const { nombre, pais, isActive } = createDepartamentosPaiDto;
    try {
      const pais_exist = await this.paisRepo.findOne({ where: { id: pais } });
      if (!pais_exist)
        throw new NotFoundException('No se encontro el pais seleccionado');

      const departamento = this.departamentoRepo.create({
        nombre,
        pais: pais_exist,
        isActive,
      });

      await this.departamentoRepo.save(departamento);

      return 'Departamento creado exitosamente';
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async findAll(paisId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const pais_exist = await this.paisRepo.findOne({ where: { id: paisId } });
      if (!pais_exist)
        throw new NotFoundException('No se encontro el pais seleccionado.');
      const [departamentos, total] = await this.departamentoRepo.findAndCount({
        skip: offset,
        take: limit,
        where: { pais: pais_exist },
        relations: ['pais'],
      });
      if (!departamentos || departamentos.length === 0)
        throw new BadRequestException(
          'No se encontraron departamentos disponibles',
        );
      return { departamentos, total };
    } catch (error) {
      throw error;
    }
  }

  async findAllDeptosActives(paisId: string) {
    try {
      const pais_exist = await this.paisRepo.findOne({ where: { id: paisId } });
      if (!pais_exist)
        throw new NotFoundException('No se encontro el pais seleccionado.');
      const departamentos = await this.departamentoRepo.find({
        where: {
          pais: pais_exist,
          isActive: true,
        },
      });
      if (!departamentos || departamentos.length === 0)
        throw new BadRequestException(
          'No se encontraron departamentos disponibles',
        );
      return departamentos;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} departamentosPai`;
  }

  async update(
    id: string,
    updateDepartamentosPaiDto: UpdateDepartamentosPaiDto,
  ) {
    try {
      const departamento = await this.departamentoRepo.findOne({
        where: { id },
        relations: ['pais'],
      });

      if (!departamento) {
        throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
      }

      if (updateDepartamentosPaiDto.pais) {
        const nuevoPais = await this.paisRepo.findOne({
          where: { id: updateDepartamentosPaiDto.pais },
        });

        if (!nuevoPais) {
          throw new NotFoundException('El nuevo país seleccionado no existe');
        }

        departamento.pais = nuevoPais;
      }

      if (updateDepartamentosPaiDto.nombre) {
        const nombreExistente = await this.departamentoRepo.findOne({
          where: {
            nombre: updateDepartamentosPaiDto.nombre,
            pais: { id: departamento.pais.id },
          },
        });

        if (nombreExistente && nombreExistente.id !== id) {
          throw new BadRequestException(
            'Ya existe un departamento con ese nombre en el país seleccionado',
          );
        }

        departamento.nombre = updateDepartamentosPaiDto.nombre;
      }

      if (updateDepartamentosPaiDto.isActive !== undefined) {
        departamento.isActive = updateDepartamentosPaiDto.isActive;
      }

      await this.departamentoRepo.save(departamento);

      return {
        message: 'Departamento actualizado exitosamente',
        departamento,
      };
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} departamentosPai`;
  }

  private handleDatabaseErrors(error: any): never {
    if (error.code === '23505') {
      const detail = error.detail.toLowerCase();

      if (detail.includes('nombre')) {
        throw new BadRequestException(
          'El nombre del departamento ya está registrado',
        );
      }

      throw new BadRequestException('Registro duplicado: ' + error.detail);
    }

    throw new error();
  }
}
