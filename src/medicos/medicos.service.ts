import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medico } from './entities/medico.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { instanceToPlain } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medico_repo: Repository<Medico>,
    @InjectRepository(User)
    private readonly user_repo: Repository<User>,
    @InjectRepository(SubServicio)
    private readonly servicio_repo: Repository<SubServicio>,
  ) {}
  async create(createMedicoDto: CreateMedicoDto) {
    const {
      usuarioId,
      universidad_formacion,
      numero_colegiado,
      especialidad,
      areas_trabajo,
      anios_experiencia,
      isActive,
    } = createMedicoDto;

    try {
      const usuario_existe = await this.user_repo.findOne({
        where: { id: usuarioId },
      });

      if (!usuario_existe) {
        throw new NotFoundException(
          'No se encontró el usuario seleccionado para médico',
        );
      }

      const medico_existente = await this.medico_repo.findOne({
        where: { usuario: { id: usuarioId } },
      });

      if (medico_existente) {
        throw new ConflictException(
          'El usuario ya está registrado como médico',
        );
      }

      const servicios = await this.servicio_repo.find({
        where: {
          id: In(areas_trabajo),
        },
      });

      if (servicios.length !== areas_trabajo.length) {
        throw new NotFoundException(
          'Uno o más servicios no fueron encontrados',
        );
      }

      const medico = this.medico_repo.create({
        anios_experiencia,
        areas_trabajo: servicios,
        especialidad,
        isActive,
        numero_colegiado,
        universidad_formacion,
        usuario: usuario_existe,
      });

      await this.medico_repo.save(medico);

      return 'Médico creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, name = '' } = paginationDto;

    try {
      const [medicos, total] = await this.medico_repo
        .createQueryBuilder('medico')
        .leftJoinAndSelect('medico.usuario', 'usuario')
        .leftJoinAndSelect('usuario.profileImages', 'profileImages')
        .leftJoinAndSelect('medico.areas_trabajo', 'areas_trabajo')
        .leftJoinAndSelect('medico.horarios', 'horarios')
        .andWhere('LOWER(usuario.name) LIKE :name', {
          name: `%${name.toLowerCase()}%`,
        })
        .addOrderBy('profileImages.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      if (!medicos || medicos.length === 0) {
        throw new NotFoundException(
          'No se encontraron médicos disponibles en este momento.',
        );
      }

      return {
        total,
        data: instanceToPlain(medicos),
      };
    } catch (error) {
      throw error;
    }
  }

  async findByEspecialidades(id: string) {
    try {
      const especialidad = await this.servicio_repo.findOne({ where: { id } });
      if (!especialidad)
        throw new NotFoundException(
          'No se encontró la especialidad seleccionada',
        );

      const medicos = await this.medico_repo
        .createQueryBuilder('medico')
        .leftJoinAndSelect('medico.usuario', 'usuario')
        .leftJoinAndSelect('medico.areas_trabajo', 'area')
        .where('medico.isActive = :isActive', { isActive: true })
        .andWhere('area.id = :areaId', { areaId: id })
        .getMany();

      if (!medicos || medicos.length === 0)
        throw new NotFoundException(
          'No se encontraron médicos disponibles en esta especialidad',
        );

      return instanceToPlain(medicos);
    } catch (error) {
      throw error;
    }
  }

  async findByEspecialidadesByPais(paisId: string, id: string) {
    try {
      const especialidad = await this.servicio_repo.findOne({ where: { id } });
      if (!especialidad)
        throw new NotFoundException(
          'No se encontró la especialidad seleccionada',
        );

      const medicos = await this.medico_repo
        .createQueryBuilder('medico')
        .leftJoinAndSelect('medico.usuario', 'usuario')
        .leftJoinAndSelect('medico.areas_trabajo', 'area')
        .where('medico.isActive = :isActive', { isActive: true })
        .andWhere('area.id = :areaId', { areaId: id })
        .andWhere('usuario.pais.id = :paisId', { paisId })
        .getMany();

      if (!medicos || medicos.length === 0)
        throw new NotFoundException(
          'No se encontraron médicos disponibles en esta especialidad',
        );

      return instanceToPlain(medicos);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const medico = await this.medico_repo.findOne({ where: { id } });
      if (!medico)
        throw new NotFoundException('No se encontro el medico seleccionado');
      return instanceToPlain(medico);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateMedicoDto: UpdateMedicoDto) {
    const {
      anios_experiencia,
      areas_trabajo,
      especialidad,
      isActive,
      numero_colegiado,
      usuarioId,
      universidad_formacion,
    } = updateMedicoDto;

    try {
      const medico = await this.medico_repo.findOne({
        where: { id },
        relations: ['areas_trabajo', 'usuario'],
      });

      if (!medico) {
        throw new NotFoundException('No se encontró el médico a actualizar');
      }

      if (usuarioId) {
        const nuevoUsuario = await this.user_repo.findOne({
          where: { id: usuarioId },
        });

        if (!nuevoUsuario) {
          throw new NotFoundException('El nuevo usuario no fue encontrado');
        }

        const medicoExistente = await this.medico_repo.findOne({
          where: { usuario: { id: usuarioId } },
        });

        if (medicoExistente && medicoExistente.id !== id) {
          throw new ConflictException(
            'El usuario ya está asignado a otro médico',
          );
        }

        medico.usuario = nuevoUsuario;
      }

      let servicios = medico.areas_trabajo;
      if (areas_trabajo && areas_trabajo.length > 0) {
        servicios = await this.servicio_repo.find({
          where: { id: In(areas_trabajo) },
        });

        if (servicios.length !== areas_trabajo.length) {
          throw new NotFoundException(
            'Uno o más servicios proporcionados no existen',
          );
        }
      }

      medico.anios_experiencia = anios_experiencia ?? medico.anios_experiencia;
      medico.especialidad = especialidad ?? medico.especialidad;
      medico.isActive = isActive ?? medico.isActive;
      medico.numero_colegiado = numero_colegiado ?? medico.numero_colegiado;
      medico.universidad_formacion =
        universidad_formacion ?? medico.universidad_formacion;
      medico.areas_trabajo = servicios;

      await this.medico_repo.save(medico);

      return {
        message: 'Médico actualizado exitosamente',
        data: instanceToPlain(medico),
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} medico`;
  }
}
