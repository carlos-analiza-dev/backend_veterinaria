import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnalisisUsuarioDto } from './dto/create-analisis_usuario.dto';
import { UpdateAnalisisUsuarioDto } from './dto/update-analisis_usuario.dto';

import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AnalisisEficiencia } from './entities/analisis_usuario.entity';
import { User } from 'src/auth/entities/auth.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AnalisisUsuarioService {
  constructor(
    @InjectRepository(AnalisisEficiencia)
    private readonly analisisRepository: Repository<AnalisisEficiencia>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateAnalisisUsuarioDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: createDto.userId },
      });
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      if (!createDto.eficienciaInsumos && createDto.rendimiento) {
        createDto.eficienciaInsumos = this.calcularEficienciaDefault(
          createDto.rendimiento,
        );
      }

      const analisis = this.analisisRepository.create({
        ...createDto,
        user,
      });

      const analisis_plain = instanceToPlain(analisis);

      await this.analisisRepository.save(analisis_plain);

      return 'Analisis creado exitosamente';
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto, userId?: string) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const queryBuilder = this.analisisRepository
        .createQueryBuilder('analisis')
        .leftJoinAndSelect('analisis.user', 'user')
        .take(limit)
        .skip(offset);

      if (userId) {
        queryBuilder.where('analisis.userId = :userId', { userId });
      }

      const [analisis, total] = await queryBuilder.getManyAndCount();

      const analisis_plain = instanceToPlain(analisis);

      return {
        data: analisis_plain,

        total,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: string) {
    const analisis = await this.analisisRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!analisis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    return this.transformAnalisis(analisis);
  }

  async update(id: string, updateDto: UpdateAnalisisUsuarioDto) {
    try {
      const analisis = await this.analisisRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!analisis) {
        throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
      }

      if (updateDto.userId) {
        const user = await this.userRepository.findOne({
          where: { id: updateDto.userId },
        });
        if (!user) {
          throw new BadRequestException('Usuario no encontrado');
        }
        analisis.user = user;
      }

      this.analisisRepository.merge(analisis, updateDto);
      await this.analisisRepository.save(analisis);

      return {
        success: true,
        message: 'Análisis actualizado exitosamente',
        data: this.transformAnalisis(analisis),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const analisis = await this.analisisRepository.findOne({ where: { id } });
    if (!analisis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    await this.analisisRepository.remove(analisis);

    return {
      success: true,
      message: 'Análisis eliminado exitosamente',
      id,
    };
  }

  private transformAnalisis(analisis: AnalisisEficiencia) {
    return {
      ...analisis,
      userId: analisis.user?.id,
    };
  }

  private calcularEficienciaDefault(rendimiento: number): number {
    if (rendimiento > 5000) return 85.0;
    if (rendimiento > 3000) return 75.0;
    return 65.0;
  }

  private handleDBExceptions(error: any) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Error inesperado, verifique los logs del servidor',
    );
  }
}
