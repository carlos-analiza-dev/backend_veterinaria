import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import {
  LessThan,
  LessThanOrEqual,
  Repository,
  MoreThan,
  MoreThanOrEqual,
  Not,
  In,
} from 'typeorm';
import { Medico } from 'src/medicos/entities/medico.entity';
import { HorariosMedico } from 'src/horarios_medicos/entities/horarios_medico.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { EstadoCita } from 'src/interfaces/estados_citas';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citas_repo: Repository<Cita>,
    @InjectRepository(Medico)
    private readonly medico_repo: Repository<Medico>,
    @InjectRepository(HorariosMedico)
    private readonly horarios_repo: Repository<HorariosMedico>,
    @InjectRepository(FincasGanadero)
    private readonly finca_ganadero: Repository<FincasGanadero>,
    @InjectRepository(AnimalFinca)
    private readonly animal_ganadero: Repository<AnimalFinca>,
    @InjectRepository(SubServicio)
    private readonly sub_servicio_repo: Repository<SubServicio>,
    @InjectRepository(User)
    private readonly user_repo: Repository<User>,
    private readonly email_service: MailService,
  ) {}

  async create(createCitaDto: CreateCitaDto) {
    const {
      medicoId,
      fecha,
      horaInicio,
      duracion = 1,
      animalesId,
      cantidadAnimales,
      fincaId,
      subServicioId,
      totalPagar,
      totalFinal,
      usuarioId,
    } = createCitaDto;

    const [horas, minutos] = horaInicio.split(':').map(Number);
    const horaFin = `${(horas + duracion).toString().padStart(2, '0')}:${minutos
      .toString()
      .padStart(2, '0')}:00`;

    const fechaDate = new Date(fecha);
    const diaSemana = fechaDate.getDay();

    const horarioValido = await this.horarios_repo.findOne({
      where: {
        medico: { id: medicoId },
        diaSemana,
        disponible: true,
        horaInicio: LessThanOrEqual(horaInicio),
        horaFin: MoreThanOrEqual(horaFin),
      },
    });

    if (!horarioValido) {
      throw new BadRequestException('El médico no trabaja en ese horario');
    }

    const citasSolapadas = await this.citas_repo.find({
      where: {
        medico: { id: medicoId },
        fecha,
        horaInicio: LessThan(horaFin),
        horaFin: MoreThan(horaInicio),
      },
    });

    if (citasSolapadas.length > 0) {
      throw new BadRequestException(
        'El médico ya tiene una cita en ese horario',
      );
    }

    if (!Array.isArray(animalesId) || animalesId.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos un animal');
    }

    const animales = await this.animal_ganadero.findBy({ id: In(animalesId) });

    if (animales.length !== animalesId.length) {
      throw new NotFoundException('Uno o más animales no existen');
    }

    const citasExistentes = await this.citas_repo
      .createQueryBuilder('cita')
      .leftJoin('cita.animales', 'animal')
      .where('cita.fecha = :fecha', { fecha })
      .andWhere('animal.id IN (:...ids)', { ids: animalesId })
      .getMany();

    if (citasExistentes.length > 0) {
      throw new BadRequestException(
        'Uno o más animales ya tienen una cita agendada para esta fecha.',
      );
    }

    const finca_exist = await this.finca_ganadero.findOne({
      where: { id: fincaId },
    });
    if (!finca_exist)
      throw new NotFoundException('No se encontro la finca seleccionada');

    const medico_exist = await this.medico_repo.findOne({
      where: { id: medicoId },
    });
    if (!medico_exist)
      throw new NotFoundException('No se encontro el medico seleccionado');

    const servicio_exist = await this.sub_servicio_repo.findOne({
      where: { id: subServicioId },
    });
    if (!servicio_exist)
      throw new NotFoundException(
        'El servicio seleccionado no esta disponible en este momento',
      );

    const usuario_exist = await this.user_repo.findOne({
      where: { id: usuarioId },
    });
    if (!usuario_exist)
      throw new NotFoundException(
        'El usuario seleccionado no esta disponible en este momento',
      );

    if (cantidadAnimales <= 0) {
      throw new BadRequestException(
        'La cantidad de animales debe ser mayor a cero',
      );
    }

    const nuevaCita = this.citas_repo.create({
      animales,
      cantidadAnimales,
      finca: finca_exist,
      medico: medico_exist,
      subServicio: servicio_exist,
      fecha,
      horaInicio: `${horaInicio}:00`,
      horaFin,
      duracion,
      totalPagar,
      totalFinal,
      user: usuario_exist,
    });

    try {
      await this.email_service.sendEmailCrearCita(
        medico_exist.usuario.email,
        medico_exist.usuario.name,
        usuario_exist.name,
        finca_exist.nombre_finca,
        horaInicio,
        horaFin,
      );
    } catch (emailError) {
      throw new BadRequestException('Error enviando notificación de cita');
    }

    return this.citas_repo.save(nuevaCita);
  }

  async getHorariosDisponibles(
    medicoId: string,
    fecha: string,
    duracionServicioHoras: number,
  ) {
    const fechaActual = new Date();
    const fechaSolicitud = new Date(fecha);

    const fechaActualUTC = new Date(
      Date.UTC(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        fechaActual.getDate(),
      ),
    );

    if (fechaSolicitud <= fechaActualUTC) {
      return [];
    }

    const medico = await this.medico_repo.findOneBy({ id: medicoId });
    if (!medico) {
      throw new NotFoundException('Médico no encontrado');
    }

    const fechaDate = new Date(fecha);
    const diaSemanaJS = fechaDate.getDay();

    const horariosMedico = await this.horarios_repo.find({
      where: {
        medico: { id: medicoId },
        diaSemana: diaSemanaJS,
        disponible: true,
      },
      order: { horaInicio: 'ASC' },
    });

    if (horariosMedico.length === 0) {
      return [];
    }

    const citas = await this.citas_repo.find({
      where: {
        medico: { id: medicoId },
        fecha,
      },
      order: { horaInicio: 'ASC' },
    });

    const slotsDisponibles = [];

    for (const horario of horariosMedico) {
      const [horaInicioHoras] = horario.horaInicio.split(':').map(Number);
      const [horaFinHoras] = horario.horaFin.split(':').map(Number);

      for (
        let hora = horaInicioHoras;
        hora <= horaFinHoras - duracionServicioHoras;
        hora++
      ) {
        const horaFinSlot = hora + duracionServicioHoras;

        const horaInicioStr = `${String(hora).padStart(2, '0')}:00`;
        const horaFinStr = `${String(horaFinSlot).padStart(2, '0')}:00`;

        const ocupado = citas.some((cita) => {
          const [citaInicioH, citaInicioM] = cita.horaInicio
            .split(':')
            .map(Number);
          const [citaFinH, citaFinM] = cita.horaFin.split(':').map(Number);

          const citaInicioMin = citaInicioH * 60 + citaInicioM;
          const citaFinMin = citaFinH * 60 + citaFinM;

          const slotInicioMin = hora * 60;
          const slotFinMin = horaFinSlot * 60;

          return slotInicioMin < citaFinMin && slotFinMin > citaInicioMin;
        });

        if (!ocupado) {
          slotsDisponibles.push({
            horaInicio: horaInicioStr,
            horaFin: horaFinStr,
            duracionDisponible: duracionServicioHoras * 60,
          });
        }
      }
    }

    return slotsDisponibles.sort((a, b) =>
      a.horaInicio.localeCompare(b.horaInicio),
    );
  }

  async findAllByUser(id: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const usuario_exist = await this.user_repo.findOne({ where: { id } });
      if (!usuario_exist)
        throw new NotFoundException('No se encontró el usuario seleccionado.');

      const [citas, total] = await this.citas_repo.findAndCount({
        where: { user: { id } },
        relations: ['medico', 'animales', 'finca', 'subServicio'],
        take: limit,
        skip: offset,
        order: {
          fecha: 'DESC',
        },
      });

      if (citas.length === 0)
        throw new NotFoundException(
          'No se encontraron citas disponibles en este momento',
        );

      const citasSimplificadas = citas.map((cita) => ({
        id: cita.id,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        fecha: cita.fecha,
        estado: cita.estado,
        totalPagar: cita.totalPagar,

        medico: {
          id: cita.medico.id,
          nombre: cita.medico.usuario.name,
          especialidad: cita.medico.especialidad,
        },
        animales: cita.animales.map((animal) => ({
          id: animal.id,
          identificador: animal.identificador,
          especie: animal.especie.nombre,
          razas: animal.razas.map((raza) => raza.nombre),
        })),
        finca: {
          id: cita.finca.id,
          nombre: cita.finca.nombre_finca,
          ubicacion: cita.finca.ubicacion,
        },
        subServicio: {
          id: cita.subServicio.id,
          nombre: cita.subServicio.nombre,
          precio: cita.subServicio.preciosPorPais[0]?.precio || '0.00',
        },
      }));

      return {
        total,
        citas: citasSimplificadas,
      };
    } catch (error) {
      throw error;
    }
  }

  async findPendienteCitasByUser(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const medicoExists = await this.citas_repo
      .createQueryBuilder('cita')
      .innerJoin('cita.medico', 'medico')
      .innerJoin('medico.usuario', 'usuario')
      .select('1')
      .where('usuario.id = :userId', { userId })
      .limit(1)
      .getRawOne();

    if (!medicoExists) {
      throw new NotFoundException(
        'No se encontró un médico asociado a este usuario.',
      );
    }

    const query = this.citas_repo
      .createQueryBuilder('cita')
      .innerJoinAndSelect('cita.medico', 'medico')
      .innerJoinAndSelect('medico.usuario', 'medicoUsuario')
      .leftJoinAndSelect('cita.animales', 'animales')
      .leftJoinAndSelect('animales.especie', 'especie')
      .leftJoinAndSelect('animales.razas', 'razas')
      .leftJoinAndSelect('animales.propietario', 'propietario')
      .leftJoinAndSelect('cita.finca', 'finca')
      .leftJoinAndSelect('cita.subServicio', 'subServicio')
      .where('medicoUsuario.id = :userId', { userId })
      .andWhere('cita.estado = :estado', { estado: EstadoCita.PENDIENTE })
      .orderBy('cita.fecha', 'ASC')
      .addOrderBy('cita.horaInicio', 'ASC')
      .take(limit)
      .skip(offset);

    const [citas, total] = await query.getManyAndCount();

    if (citas.length === 0) {
      throw new NotFoundException(
        'No se encontraron citas confirmadas para este usuario médico',
      );
    }

    return {
      total,
      citas: citas.map((cita) => ({
        id: cita.id,
        fecha: cita.fecha,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        duracion: cita.duracion,
        estado: cita.estado,
        totalPagar: cita.totalPagar,
        totalFinal: cita.totalFinal,
        cantidadAnimales: cita.cantidadAnimales,
        medico: {
          id: cita.medico.id,
          nombre: cita.medico.usuario.name,
          especialidad: cita.medico.especialidad,
          telefono: cita.medico.usuario.telefono,
        },
        animales:
          cita.animales?.map((animal) => ({
            id: animal.id,
            identificador: animal.identificador,
            especie: animal.especie?.nombre || 'No especificada',
            razas: animal.razas?.map((raza) => raza.nombre) || [],
            propietario: animal.propietario
              ? {
                  name: animal.propietario.nombre || 'No especificado',
                  telefono: animal.propietario.telefono || 'No especificado',
                }
              : null,
          })) || [],
        finca: cita.finca
          ? {
              id: cita.finca.id,
              nombre_finca: cita.finca.nombre_finca,
              ubicacion: cita.finca.ubicacion,
              latitud: cita.finca.latitud,
              longitud: cita.finca.longitud,
            }
          : null,
        subServicio: cita.subServicio
          ? {
              id: cita.subServicio.id,
              nombre: cita.subServicio.nombre,
              descripcion: cita.subServicio.descripcion,
            }
          : null,
      })),
    };
  }

  async findConfirmedCitasByUser(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const medicoExists = await this.citas_repo
      .createQueryBuilder('cita')
      .innerJoin('cita.medico', 'medico')
      .innerJoin('medico.usuario', 'usuario')
      .select('1')
      .where('usuario.id = :userId', { userId })
      .limit(1)
      .getRawOne();

    if (!medicoExists) {
      throw new NotFoundException(
        'No se encontró un médico asociado a este usuario.',
      );
    }

    const query = this.citas_repo
      .createQueryBuilder('cita')
      .innerJoinAndSelect('cita.medico', 'medico')
      .innerJoinAndSelect('medico.usuario', 'medicoUsuario')
      .leftJoinAndSelect('cita.animales', 'animales')
      .leftJoinAndSelect('animales.especie', 'especie')
      .leftJoinAndSelect('animales.razas', 'razas')
      .leftJoinAndSelect('animales.propietario', 'propietario')
      .leftJoinAndSelect('cita.finca', 'finca')
      .leftJoinAndSelect('cita.subServicio', 'subServicio')
      .where('medicoUsuario.id = :userId', { userId })
      .andWhere('cita.estado = :estado', { estado: EstadoCita.CONFIRMADA })
      .orderBy('cita.fecha', 'ASC')
      .addOrderBy('cita.horaInicio', 'ASC')
      .take(limit)
      .skip(offset);

    const [citas, total] = await query.getManyAndCount();

    if (citas.length === 0) {
      throw new NotFoundException(
        'No se encontraron citas confirmadas para este usuario médico',
      );
    }

    return {
      total,
      citas: citas.map((cita) => ({
        id: cita.id,
        fecha: cita.fecha,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        duracion: cita.duracion,
        estado: cita.estado,
        totalPagar: cita.totalPagar,
        totalFinal: cita.totalFinal,
        cantidadAnimales: cita.cantidadAnimales,
        medico: {
          id: cita.medico.id,
          nombre: cita.medico.usuario.name,
          especialidad: cita.medico.especialidad,
          telefono: cita.medico.usuario.telefono,
        },
        animales:
          cita.animales?.map((animal) => ({
            id: animal.id,
            identificador: animal.identificador,
            especie: animal.especie?.nombre || 'No especificada',
            razas: animal.razas?.map((raza) => raza.nombre) || [],
            propietario: animal.propietario
              ? {
                  name: animal.propietario.nombre || 'No especificado',
                  telefono: animal.propietario.telefono || 'No especificado',
                }
              : null,
          })) || [],
        finca: cita.finca
          ? {
              id: cita.finca.id,
              nombre_finca: cita.finca.nombre_finca,
              ubicacion: cita.finca.ubicacion,
              latitud: cita.finca.latitud,
              longitud: cita.finca.longitud,
            }
          : null,
        subServicio: cita.subServicio
          ? {
              id: cita.subServicio.id,
              nombre: cita.subServicio.nombre,
              descripcion: cita.subServicio.descripcion,
            }
          : null,
      })),
    };
  }

  async findAllByMedicoCitaCompleted(
    userId: string,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;

    const medicoExists = await this.citas_repo
      .createQueryBuilder('cita')
      .innerJoin('cita.medico', 'medico')
      .innerJoin('medico.usuario', 'usuario')
      .select('1')
      .where('usuario.id = :userId', { userId })
      .limit(1)
      .getRawOne();

    if (!medicoExists) {
      throw new NotFoundException(
        'No se encontró un médico asociado a este usuario.',
      );
    }

    const query = this.citas_repo
      .createQueryBuilder('cita')
      .innerJoinAndSelect('cita.medico', 'medico')
      .innerJoinAndSelect('medico.usuario', 'medicoUsuario')
      .leftJoinAndSelect('cita.animales', 'animales')
      .leftJoinAndSelect('animales.especie', 'especie')
      .leftJoinAndSelect('animales.razas', 'razas')
      .leftJoinAndSelect('animales.propietario', 'propietario')
      .leftJoinAndSelect('cita.finca', 'finca')
      .leftJoinAndSelect('cita.subServicio', 'subServicio')
      .where('medicoUsuario.id = :userId', { userId })
      .andWhere('cita.estado = :estado', { estado: EstadoCita.COMPLETADA })
      .orderBy('cita.fecha', 'ASC')
      .addOrderBy('cita.horaInicio', 'ASC')
      .take(limit)
      .skip(offset);

    const [citas, total] = await query.getManyAndCount();

    if (citas.length === 0) {
      throw new NotFoundException(
        'No se encontraron citas confirmadas para este usuario médico',
      );
    }

    return {
      total,
      citas: citas.map((cita) => ({
        id: cita.id,
        fecha: cita.fecha,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        duracion: cita.duracion,
        estado: cita.estado,
        totalPagar: cita.totalPagar,
        totalFinal: cita.totalFinal,
        cantidadAnimales: cita.cantidadAnimales,
        medico: {
          id: cita.medico.id,
          nombre: cita.medico.usuario.name,
          especialidad: cita.medico.especialidad,
          telefono: cita.medico.usuario.telefono,
        },
        animales:
          cita.animales?.map((animal) => ({
            id: animal.id,
            identificador: animal.identificador,
            especie: animal.especie?.nombre || 'No especificada',
            razas: animal.razas?.map((raza) => raza.nombre) || [],
            propietario: animal.propietario
              ? {
                  name: animal.propietario.nombre || 'No especificado',
                  telefono: animal.propietario.telefono || 'No especificado',
                }
              : null,
          })) || [],
        finca: cita.finca
          ? {
              id: cita.finca.id,
              nombre_finca: cita.finca.nombre_finca,
              ubicacion: cita.finca.ubicacion,
              latitud: cita.finca.latitud,
              longitud: cita.finca.longitud,
            }
          : null,
        subServicio: cita.subServicio
          ? {
              id: cita.subServicio.id,
              nombre: cita.subServicio.nombre,
              descripcion: cita.subServicio.descripcion,
            }
          : null,
      })),
    };
  }

  async update(id: string, updateCitaDto: UpdateCitaDto) {
    const cita = await this.citas_repo.findOne({
      where: { id },
      relations: ['medico'],
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    const {
      medicoId = cita.medico.id,
      fecha = cita.fecha,
      horaInicio = cita.horaInicio.split(':').slice(0, 2).join(':'),
      duracion = cita.duracion,
      animalesId,
      cantidadAnimales,
      fincaId,
      subServicioId,
      totalPagar,
      totalFinal,
      estado,
    } = updateCitaDto;

    if (estado) {
      if (!Object.values(EstadoCita).includes(estado)) {
        throw new BadRequestException('Estado de cita no válido');
      }

      if (
        cita.estado === EstadoCita.CANCELADA &&
        estado !== EstadoCita.CANCELADA
      ) {
        throw new BadRequestException(
          'No se puede modificar una cita cancelada',
        );
      }

      if (
        cita.estado === EstadoCita.COMPLETADA &&
        estado !== EstadoCita.COMPLETADA
      ) {
        throw new BadRequestException(
          'No se puede modificar una cita completada',
        );
      }
    }

    const [hora, minuto] = horaInicio.split(':').map(Number);
    const nuevaHoraFin = `${String(hora + duracion).padStart(2, '0')}:${String(
      minuto,
    ).padStart(2, '0')}:00`;

    const diaSemana = new Date(fecha).getDay();
    const horarioValido = await this.horarios_repo.findOne({
      where: {
        medico: { id: medicoId },
        diaSemana,
        disponible: true,
        horaInicio: LessThanOrEqual(horaInicio),
        horaFin: MoreThanOrEqual(nuevaHoraFin),
      },
    });

    if (!horarioValido) {
      throw new BadRequestException('El médico no trabaja en ese horario');
    }

    const citasSolapadas = await this.citas_repo.find({
      where: {
        medico: { id: medicoId },
        fecha,
        id: Not(id),
        horaInicio: LessThan(nuevaHoraFin),
        horaFin: MoreThan(horaInicio),
      },
    });

    if (citasSolapadas.length > 0) {
      throw new BadRequestException(
        'El médico ya tiene una cita en ese horario',
      );
    }

    if (animalesId && animalesId.length > 0 && Array.isArray(animalesId)) {
      const animales = await this.animal_ganadero.findBy({
        id: In(animalesId),
      });
      if (animales.length !== animalesId.length) {
        throw new NotFoundException('Uno o más animales no fueron encontrados');
      }

      const citasExistentes = await this.citas_repo
        .createQueryBuilder('cita')
        .leftJoin('cita.animales', 'animal')
        .where('cita.fecha = :fecha', { fecha })
        .andWhere('animal.id IN (:...ids)', { ids: animalesId })
        .andWhere('cita.id != :id', { id })
        .getMany();

      if (citasExistentes.length > 0) {
        throw new BadRequestException(
          'Uno o más animales ya tienen una cita agendada para esta fecha.',
        );
      }

      cita.animales = animales;
      cita.cantidadAnimales = animales.length;
    }

    if (fincaId) {
      const finca = await this.finca_ganadero.findOne({
        where: { id: fincaId },
      });
      if (!finca) throw new NotFoundException('Finca no encontrada');
      cita.finca = finca;
    }

    if (subServicioId) {
      const subServicio = await this.sub_servicio_repo.findOne({
        where: { id: subServicioId },
      });
      if (!subServicio)
        throw new NotFoundException('Sub-servicio no encontrado');
      cita.subServicio = subServicio;
    }

    cita.fecha = fecha;
    cita.horaInicio = `${horaInicio}:00`;
    cita.horaFin = nuevaHoraFin;
    cita.duracion = duracion;
    cita.totalPagar = totalPagar ?? cita.totalPagar;
    cita.totalFinal = totalFinal ?? cita.totalFinal;
    cita.cantidadAnimales = cantidadAnimales ?? cita.cantidadAnimales;
    cita.estado = estado;

    return await this.citas_repo.save(cita);
  }
}
