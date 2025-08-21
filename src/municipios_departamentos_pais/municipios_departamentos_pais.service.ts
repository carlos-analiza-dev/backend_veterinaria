import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMunicipiosDepartamentosPaiDto } from './dto/create-municipios_departamentos_pai.dto';
import { UpdateMunicipiosDepartamentosPaiDto } from './dto/update-municipios_departamentos_pai.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MunicipiosDepartamentosPai } from './entities/municipios_departamentos_pai.entity';
import { Repository } from 'typeorm';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class MunicipiosDepartamentosPaisService {
  constructor(
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepo: Repository<MunicipiosDepartamentosPai>,
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,
  ) {}
  async create(
    createMunicipiosDepartamentosPaiDto: CreateMunicipiosDepartamentosPaiDto,
  ) {
    const { nombre, departamento, isActive } =
      createMunicipiosDepartamentosPaiDto;
    try {
      const depto_exist = await this.departamentoRepo.findOne({
        where: { id: departamento },
      });
      if (!depto_exist)
        throw new NotFoundException(
          'No se encontro el departamento seleccionado',
        );
      const municipio = this.municipioRepo.create({
        nombre,
        isActive,
        departamento: depto_exist,
      });

      await this.municipioRepo.save(municipio);

      return 'Municipio creado exitosamente';
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async findAll(departamentoId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const depto_exist = await this.departamentoRepo.findOne({
        where: { id: departamentoId },
      });
      if (!depto_exist)
        throw new NotFoundException(
          'No se encontro el departamento seleccionado.',
        );
      const [municipios, total] = await this.municipioRepo.findAndCount({
        skip: offset,
        take: limit,
        where: { departamento: depto_exist },
        relations: ['departamento'],
      });
      if (!municipios || municipios.length === 0)
        throw new BadRequestException(
          'No se encontraron municipios disponibles',
        );
      return { municipios, total };
    } catch (error) {
      throw error;
    }
  }

  async findAllActivos(departamentoId: string) {
    try {
      const depto_exist = await this.departamentoRepo.findOne({
        where: { id: departamentoId },
      });
      if (!depto_exist)
        throw new NotFoundException(
          'No se encontro el departamento seleccionado.',
        );
      const municipios = await this.municipioRepo.find({
        where: {
          departamento: depto_exist,
          isActive: true,
        },
        relations: ['departamento'],
      });
      if (!municipios || municipios.length === 0)
        throw new BadRequestException(
          'No se encontraron municipios disponibles',
        );
      return municipios;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} municipiosDepartamentosPai`;
  }

  async update(id: string, updateDto: UpdateMunicipiosDepartamentosPaiDto) {
    const municipio = await this.municipioRepo.findOne({
      where: { id },
      relations: ['departamento'],
    });

    if (!municipio) {
      throw new NotFoundException(`Municipio con id ${id} no encontrado`);
    }

    if (updateDto.departamento) {
      const departamento = await this.departamentoRepo.findOne({
        where: { id: updateDto.departamento },
      });

      if (!departamento) {
        throw new NotFoundException(
          'No se encontró el departamento proporcionado',
        );
      }

      municipio.departamento = departamento;
    }

    municipio.nombre =
      updateDto.nombre !== undefined ? updateDto.nombre : municipio.nombre;
    municipio.isActive =
      updateDto.isActive !== undefined
        ? updateDto.isActive
        : municipio.isActive;

    try {
      await this.municipioRepo.save(municipio);
      return 'Municipio actualizado correctamente';
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} municipiosDepartamentosPai`;
  }

  private handleDatabaseErrors(error: any): never {
    if (error.code === '23505') {
      const detail = error.detail.toLowerCase();

      if (detail.includes('nombre')) {
        throw new BadRequestException(
          'El nombre del municipio ya está registrado',
        );
      }

      throw new BadRequestException('Registro duplicado: ' + error.detail);
    }

    throw new error();
  }
}
