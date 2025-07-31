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
      animalId,
      cantidadAnimales,
      fincaId,
      subServicioId,
      totalPagar,
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

    const animal_exist = await this.animal_ganadero.findOne({
      where: { id: animalId },
    });
    if (!animal_exist)
      throw new NotFoundException('No se encontro el animal seleccionado');

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

    const citaExistente = await this.citas_repo.findOne({
      where: {
        animal: { id: animalId },
        fecha,
      },
    });

    if (citaExistente) {
      throw new BadRequestException(
        'El animal ya tiene una cita agendada para esta fecha.',
      );
    }

    if (cantidadAnimales <= 0) {
      throw new BadRequestException(
        'La cantidad de animales debe ser mayor a cero',
      );
    }

    const nuevaCita = this.citas_repo.create({
      animal: animal_exist,
      cantidadAnimales,
      finca: finca_exist,
      medico: medico_exist,
      subServicio: servicio_exist,
      fecha,
      horaInicio: `${horaInicio}:00`,
      horaFin,
      duracion,
      totalPagar,
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
        relations: ['medico', 'animal', 'finca', 'subServicio'],
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
      const cita_aplanada = instanceToPlain(citas);
      return {
        total,
        citas: cita_aplanada,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllByMedico(id: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const medico_exist = await this.user_repo.findOne({
        where: { id },
      });
      if (!medico_exist)
        throw new NotFoundException('No se encontró el medico seleccionado.');

      const [citas, total] = await this.citas_repo.findAndCount({
        where: {
          medico: { usuario: { id } },
          estado: EstadoCita.PENDIENTE,
        },
        relations: ['medico', 'animal', 'finca', 'subServicio'],
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
      const cita_aplanada = instanceToPlain(citas);
      return {
        total,
        citas: cita_aplanada,
      };
    } catch (error) {
      throw error;
    }
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
      animalId,
      cantidadAnimales,
      fincaId,
      subServicioId,
      totalPagar,
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

    if (animalId) {
      const animal = await this.animal_ganadero.findOne({
        where: { id: animalId },
      });
      if (!animal) throw new NotFoundException('Animal no encontrado');
      cita.animal = animal;
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
    cita.cantidadAnimales = cantidadAnimales ?? cita.cantidadAnimales;
    cita.estado = estado;

    return await this.citas_repo.save(cita);
  }
}
