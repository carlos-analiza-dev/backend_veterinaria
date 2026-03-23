import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { EstadoCeloAnimal } from 'src/interfaces/celos.animal.enum';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import { EstadoServicio } from 'src/interfaces/servicios-reproductivos.enum';
import { ESPECIE_CONFIG } from 'src/interfaces/especies-config';

@Injectable()
export class CelosAnimalValidationService {
  constructor(
    @InjectRepository(CelosAnimal)
    private celosAnimalRepository: Repository<CelosAnimal>,
    @InjectRepository(ServicioReproductivo)
    private servicioRepository: Repository<ServicioReproductivo>,
  ) {}

  async validarAnimalParaCelo(animal: AnimalFinca): Promise<void> {
    if (animal.castrado || animal.esterelizado) {
      throw new BadRequestException(
        'El animal está castrado/esterilizado, no puede presentar celo',
      );
    }

    if (animal.sexo !== 'Hembra') {
      throw new BadRequestException('Solo las hembras pueden registrar celo');
    }
  }

  async validarAnimalNoPreñado(animal: AnimalFinca): Promise<void> {
    const celosPreñado = animal.celos?.filter(
      (celo) =>
        celo.estado === EstadoCeloAnimal.PREÑADO ||
        celo.estado === EstadoCeloAnimal.SERVIDO,
    );

    if (!celosPreñado || celosPreñado.length === 0) {
      return;
    }

    const ultimoCeloPreñado = celosPreñado.sort(
      (a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime(),
    )[0];

    const serviciosDeCelo = await this.servicioRepository.find({
      where: { celo_asociado: { id: ultimoCeloPreñado.id } },
      relations: ['celo_asociado'],
    });

    if (serviciosDeCelo.length === 0) {
      return;
    }

    const servicioAsociado = serviciosDeCelo.sort(
      (a, b) => b.fecha_servicio.getTime() - a.fecha_servicio.getTime(),
    )[0];

    const fechaServicio = servicioAsociado.fecha_servicio;
    const fechaActual = new Date();

    const diasTranscurridos = Math.floor(
      (fechaActual.getTime() - fechaServicio.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Obtener período de gestación según especie
    const periodoGestacion = this.obtenerPeriodoGestacion(
      animal.especie.nombre,
    );

    if (diasTranscurridos < periodoGestacion) {
      const fechaFinGestacion = new Date(fechaServicio);
      fechaFinGestacion.setDate(fechaFinGestacion.getDate() + periodoGestacion);
      const diasRestantes = periodoGestacion - diasTranscurridos;

      throw new BadRequestException(
        `❌ El animal está en período de gestación.\n\n` +
          `📅 Fecha de servicio exitoso: ${fechaServicio.toLocaleDateString()}\n` +
          `🐄 Especie: ${animal.especie.nombre}\n` +
          `📆 Período de gestación: ${periodoGestacion} días\n` +
          `⏱️ Días transcurridos: ${diasTranscurridos}\n` +
          `⏳ Días restantes: ${diasRestantes}\n` +
          `🎯 Fecha estimada de parto: ${fechaFinGestacion.toLocaleDateString()}\n\n` +
          `⚠️ No puede registrar un nuevo celo hasta después del parto.`,
      );
    }

    // Si pasó el período de gestación, verificar si ya hubo parto
    await this.validarPartoRegistrado(animal, fechaServicio, periodoGestacion);
  }

  private async validarPartoRegistrado(
    animal: AnimalFinca,
    fechaServicio: Date,
    periodoGestacion: number,
  ): Promise<void> {
    // Calcular fecha esperada de parto
    const fechaEsperadaParto = new Date(fechaServicio);
    fechaEsperadaParto.setDate(fechaEsperadaParto.getDate() + periodoGestacion);

    const fechaActual = new Date();

    // Buscar si hay registros de parto para este animal
    // Nota: Necesitas implementar la entidad Parto
    // Por ahora, esta es una validación placeholder
    const tienePartoRegistrado = await this.verificarPartoRegistrado(
      animal,
      fechaServicio,
    );

    if (!tienePartoRegistrado) {
      const diasPostPartoEsperado = Math.floor(
        (fechaActual.getTime() - fechaEsperadaParto.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diasPostPartoEsperado > 0) {
        throw new BadRequestException(
          `⚠️ El período de gestación ha finalizado, pero no se ha registrado el parto.\n\n` +
            `📅 Fecha de servicio: ${fechaServicio.toLocaleDateString()}\n` +
            `🎯 Fecha estimada de parto: ${fechaEsperadaParto.toLocaleDateString()}\n` +
            `⏰ Han pasado ${diasPostPartoEsperado} días desde la fecha estimada de parto.\n\n` +
            `❗ Por favor registre el parto antes de continuar con nuevos registros de celo.`,
        );
      }
    }
  }

  private async verificarPartoRegistrado(
    animal: AnimalFinca,
    fechaServicio: Date,
  ): Promise<boolean> {
    // TODO: Implementar cuando tengas la entidad Parto
    // Por ahora retorna true para permitir el flujo
    // Cuando implementes Parto, deberías hacer:
    // const parto = await this.partoRepository.findOne({
    //   where: {
    //     animal: { id: animal.id },
    //     fecha_parto: MoreThan(fechaServicio)
    //   }
    // });
    // return !!parto;

    return true; // Placeholder
  }

  async calcularNumeroCelo(animalId: string): Promise<number> {
    const count = await this.celosAnimalRepository.count({
      where: { animal: { id: animalId } },
    });
    return count + 1;
  }

  async validarDuracionCelo(
    especie: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<void> {
    const duracionHoras =
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
    const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];

    if (
      config &&
      (duracionHoras < config.duracionHoras.min ||
        duracionHoras > config.duracionHoras.max)
    ) {
      throw new BadRequestException(
        `La duración del celo para ${especie} debe estar entre ${config.duracionHoras.min} y ${config.duracionHoras.max} horas.\n` +
          `Duración registrada: ${duracionHoras.toFixed(1)} horas`,
      );
    }
  }

  validarSecreciones(especie: string, secreciones: string): void {
    const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];
    if (
      config &&
      secreciones &&
      !config.coloresSecrecion.includes(secreciones?.toLowerCase())
    ) {
      console.warn(`⚠️ Secreción inusual para ${especie}: ${secreciones}`);
    }
  }

  async validarSinCeloActivo(
    animalId: string,
    fechaInicio: Date,
    fechaFin?: Date,
  ): Promise<void> {
    const queryBuilder = this.celosAnimalRepository
      .createQueryBuilder('celo')
      .where('celo.animalId = :animalId', { animalId })
      .andWhere(
        '(' +
          'celo.fechaFin IS NULL OR ' +
          '(:fechaInicio BETWEEN celo.fechaInicio AND COALESCE(celo.fechaFin, :infinito) OR ' +
          'COALESCE(:fechaFin, :infinito) BETWEEN celo.fechaInicio AND COALESCE(celo.fechaFin, :infinito) OR ' +
          'celo.fechaInicio BETWEEN :fechaInicio AND COALESCE(:fechaFin, :infinito))' +
          ')',
        {
          fechaInicio,
          fechaFin: fechaFin || new Date('2999-12-31'),
          infinito: new Date('2999-12-31'),
        },
      );

    const celosActivos = await queryBuilder.getMany();

    if (celosActivos.length > 0) {
      const celo = celosActivos[0];
      const estado = celo.fechaFin ? 'activo' : 'solapado';
      throw new BadRequestException(
        `El animal ya tiene un registro de celo ${estado} para este período.\n` +
          `📅 Inicio: ${celo.fechaInicio.toLocaleDateString()} ${celo.fechaFin ? `\n📅 Fin: ${celo.fechaFin.toLocaleDateString()}` : '\n⏳ Estado: Activo'}`,
      );
    }
  }

  validarFechas(fechaInicio: Date, fechaFin?: Date): void {
    const ahora = new Date();

    if (fechaInicio > ahora) {
      throw new BadRequestException('No puedes registrar un celo en el futuro');
    }

    if (fechaFin) {
      if (fechaFin <= fechaInicio) {
        throw new BadRequestException(
          'La fecha fin debe ser posterior a la fecha de inicio',
        );
      }

      const diasDiferencia =
        (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
      if (diasDiferencia > 30) {
        throw new BadRequestException(
          'El período de celo no puede durar más de 30 días',
        );
      }
    }
  }

  async validarCicloEstral(
    animal: AnimalFinca,
    fechaInicio: Date,
  ): Promise<void> {
    // Obtener el último celo registrado (excluyendo PREÑADO)
    const ultimoCelo = await this.celosAnimalRepository.findOne({
      where: {
        animal: { id: animal.id },
        estado: Not(EstadoCeloAnimal.PREÑADO),
      },
      order: { fechaInicio: 'DESC' },
    });

    if (ultimoCelo) {
      const diasDesdeUltimoCelo = Math.floor(
        (fechaInicio.getTime() - ultimoCelo.fechaInicio.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const configCiclo =
        ESPECIE_CONFIG[animal.especie.nombre as keyof typeof ESPECIE_CONFIG];
      const cicloMinimo = configCiclo?.cicloDias?.min || 18;

      if (diasDesdeUltimoCelo < cicloMinimo) {
        throw new BadRequestException(
          `El ciclo estral para ${animal.especie.nombre} es de ${cicloMinimo} días mínimo.\n` +
            `Han pasado solo ${diasDesdeUltimoCelo} días desde el último celo registrado.\n` +
            `📅 Último celo: ${ultimoCelo.fechaInicio.toLocaleDateString()}\n` +
            `⏳ Espere ${cicloMinimo - diasDesdeUltimoCelo} días más para registrar un nuevo celo.`,
        );
      }
    }
  }

  private obtenerPeriodoGestacion(especie: string): number {
    const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];

    if (!config) {
      console.warn(
        `⚠️ Especie ${especie} no reconocida para período de gestación`,
      );
      return 285;
    }

    return config.periodoGestacionDias;
  }

  async validarTodasLasValidaciones(
    animal: AnimalFinca,
    fechaInicio: Date,
    fechaFin?: Date,
    secreciones?: string,
  ): Promise<void> {
    await this.validarAnimalParaCelo(animal);
    await this.validarAnimalNoPreñado(animal);
    await this.validarSinCeloActivo(animal.id, fechaInicio, fechaFin);
    await this.validarCicloEstral(animal, fechaInicio);

    this.validarFechas(fechaInicio, fechaFin);

    if (fechaFin) {
      await this.validarDuracionCelo(
        animal.especie.nombre,
        fechaInicio,
        fechaFin,
      );
    }

    if (secreciones) {
      this.validarSecreciones(animal.especie.nombre, secreciones);
    }
  }

  //ACTUALIZACOPM DE ESTADOS AUTOMATICAS
  async actualizarEstadosCelosVencidos(): Promise<{
    actualizados: number;
    detalles: Array<{
      celoId: string;
      estadoAnterior: string;
      estadoNuevo: string;
      razon: string;
    }>;
  }> {
    const hoy = new Date();

    const celosVencidos = await this.celosAnimalRepository
      .createQueryBuilder('celo')
      .leftJoinAndSelect('celo.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .where('celo.fechaFin IS NOT NULL')
      .andWhere('celo.fechaFin <= :hoy', { hoy })
      .andWhere('celo.estado IN (:...estados)', {
        estados: [EstadoCeloAnimal.ACTIVO, EstadoCeloAnimal.SERVIDO],
      })
      .getMany();

    const resultados = [];

    for (const celo of celosVencidos) {
      const estadoAnterior = celo.estado;
      let estadoNuevo = celo.estado;
      let razon = '';

      const serviciosAsociados = await this.servicioRepository.find({
        where: { celo_asociado: { id: celo.id } },
        relations: ['celo_asociado', 'detalles'],
      });

      if (serviciosAsociados.length === 0) {
        estadoNuevo = EstadoCeloAnimal.SIN_SERVICIO;
        razon = 'Celo finalizado sin ningún servicio asociado';
      } else {
        const servicioExitoso = serviciosAsociados.some(
          (servicio) => servicio.exitoso === true,
        );

        const serviciosRealizados = serviciosAsociados.filter(
          (servicio) =>
            servicio.estado === EstadoServicio.REALIZADO &&
            servicio.exitoso === false,
        );

        const serviciosFallidos = serviciosAsociados.filter(
          (servicio) => servicio.estado === EstadoServicio.FALLIDO,
        );

        if (servicioExitoso) {
          estadoNuevo = EstadoCeloAnimal.PREÑADO;
          razon = 'Servicio exitoso confirmado durante este celo';
        } else if (serviciosRealizados.length > 0) {
          estadoNuevo = EstadoCeloAnimal.SERVIDO;
          razon = `Servicio(s) realizado(s) (${serviciosRealizados.length}) pendiente de confirmación de éxito`;
        } else if (serviciosFallidos.length === serviciosAsociados.length) {
          estadoNuevo = EstadoCeloAnimal.NO_FECUNDADO;
          razon = 'Todos los servicios asociados fueron fallidos';
        } else {
          const tieneProgramados = serviciosAsociados.some(
            (s) => s.estado === EstadoServicio.PROGRAMADO,
          );

          if (tieneProgramados && celo.fechaFin <= hoy) {
            estadoNuevo = EstadoCeloAnimal.SIN_SERVICIO;
            razon = 'Celo finalizado con servicios programados no realizados';
          } else {
            estadoNuevo = EstadoCeloAnimal.SERVIDO;
            razon = 'Servicios asociados registrados, pendiente de evaluación';
          }
        }
      }

      if (estadoAnterior !== estadoNuevo) {
        celo.estado = estadoNuevo;
        await this.celosAnimalRepository.save(celo);

        resultados.push({
          celoId: celo.id,
          estadoAnterior,
          estadoNuevo,
          razon,
        });
      }
    }

    return {
      actualizados: resultados.length,
      detalles: resultados,
    };
  }

  async programarActualizacionAutomatica(): Promise<void> {
    await this.actualizarEstadosCelosVencidos();

    const celosActivos = await this.celosAnimalRepository
      .createQueryBuilder('celo')
      .leftJoinAndSelect('celo.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .where('celo.fechaFin IS NULL')
      .andWhere('celo.estado = :estado', { estado: EstadoCeloAnimal.ACTIVO })
      .getMany();

    for (const celo of celosActivos) {
      const ahora = new Date();
      const duracionHorasActual =
        (ahora.getTime() - celo.fechaInicio.getTime()) / (1000 * 60 * 60);

      const especieKey = celo.animal.especie.nombre.toUpperCase();
      const config = ESPECIE_CONFIG[especieKey as keyof typeof ESPECIE_CONFIG];

      if (config && duracionHorasActual > config.duracionHoras.max) {
        celo.fechaFin = ahora;

        const servicios = await this.servicioRepository.find({
          where: { celo_asociado: { id: celo.id } },
        });

        if (servicios.length > 0) {
          const tieneExitosos = servicios.some((s) => s.exitoso === true);
          if (tieneExitosos) {
            celo.estado = EstadoCeloAnimal.PREÑADO;
          } else {
            celo.estado = EstadoCeloAnimal.SERVIDO;
          }
        } else {
          celo.estado = EstadoCeloAnimal.SIN_SERVICIO;
        }

        await this.celosAnimalRepository.save(celo);
      }
    }
  }
}
