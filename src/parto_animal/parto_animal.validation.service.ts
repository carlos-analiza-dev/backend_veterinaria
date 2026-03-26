import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { EstadoServicio } from 'src/interfaces/servicios-reproductivos.enum';
import { ESPECIE_CONFIG } from 'src/interfaces/especies-config';
import { PartoAnimal } from './entities/parto_animal.entity';
import { EstadoCria, EstadoParto, SexoCria } from 'src/interfaces/partos.enums';

@Injectable()
export class PartoAnimalValidationService {
  constructor(
    @InjectRepository(PartoAnimal)
    private partoRepository: Repository<PartoAnimal>,
    @InjectRepository(AnimalFinca)
    private animalRepository: Repository<AnimalFinca>,
    @InjectRepository(ServicioReproductivo)
    private servicioRepository: Repository<ServicioReproductivo>,
    @InjectRepository(CelosAnimal)
    private celoRepository: Repository<CelosAnimal>,
  ) {}

  async validarCrearParto(
    hembraId: string,
    servicioId?: string,
    fechaParto?: Date,
  ): Promise<{
    hembra: AnimalFinca;
    servicio: ServicioReproductivo | null;
    celo: CelosAnimal | null;
  }> {
    const hembra = await this.animalRepository.findOne({
      where: { id: hembraId },
      relations: ['especie', 'finca', 'celos'],
    });

    if (!hembra) {
      throw new NotFoundException('Hembra no encontrada');
    }

    if (hembra.sexo !== 'Hembra') {
      throw new BadRequestException('Solo las hembras pueden registrar partos');
    }

    if (hembra.castrado || hembra.esterelizado) {
      throw new BadRequestException(
        'El animal está castrado/esterilizado, no puede tener partos',
      );
    }

    await this.validarEdadMinimaParto(hembra);

    await this.validarPeriodoEsperaPostParto(hembra);

    let servicio = null;
    let celo = null;

    if (servicioId) {
      servicio = await this.servicioRepository.findOne({
        where: { id: servicioId },
        relations: ['hembra', 'celo_asociado', 'macho'],
      });

      if (!servicio) {
        throw new NotFoundException(
          `Servicio no encontrado asociado a este ${hembra.especie.nombre}`,
        );
      }

      if (servicio.hembra.id !== hembraId) {
        throw new BadRequestException(
          'El servicio no corresponde a esta hembra',
        );
      }

      const partoExistente = await this.partoRepository.findOne({
        where: { servicio_asociado: { id: servicioId } },
      });

      if (partoExistente) {
        throw new BadRequestException(
          `Ya existe un parto registrado para este servicio (ID: ${partoExistente.id})`,
        );
      }

      if (!servicio.exitoso) {
        throw new BadRequestException(
          'No se puede registrar un parto para un servicio no exitoso',
        );
      }

      if (servicio.estado !== EstadoServicio.REALIZADO) {
        throw new BadRequestException(
          `El servicio debe estar en estado REALIZADO para registrar parto. Estado actual: ${servicio.estado}`,
        );
      }

      if (fechaParto) {
        await this.validarFechasGestacion(
          servicio,
          fechaParto,
          hembra.especie.nombre,
        );
      }

      if (servicio.celo_asociado) {
        celo = await this.celoRepository.findOne({
          where: { id: servicio.celo_asociado.id },
        });
      }
    }

    if (fechaParto) {
      await this.validarNoDuplicadoFecha(hembraId, fechaParto);
    }

    await this.validarIntervaloEntrePartos(hembra);

    await this.validarNoPartoActivo(hembraId, fechaParto);

    await this.validarNoPartoProgramado(hembraId, fechaParto);

    return { hembra, servicio, celo };
  }

  async validarEdadMinimaParto(hembra: AnimalFinca): Promise<void> {
    if (!hembra.fecha_nacimiento) {
      console.warn('⚠️ Animal sin fecha de nacimiento registrada');
      return;
    }

    const fechaNacimiento = new Date(hembra.fecha_nacimiento);

    if (isNaN(fechaNacimiento.getTime())) {
      throw new BadRequestException(
        'La fecha de nacimiento del animal no es válida',
      );
    }

    const fechaActual = new Date();
    const edadMeses = this.calcularEdadMeses(fechaNacimiento, fechaActual);

    const config =
      ESPECIE_CONFIG[hembra.especie.nombre as keyof typeof ESPECIE_CONFIG];

    const edadMinimaMeses = config?.edadMinimaReproduccionMeses || 18;

    if (edadMeses < edadMinimaMeses) {
      throw new BadRequestException(
        `❌ La hembra es demasiado joven para reproducción.\n\n` +
          `🐄 Especie: ${hembra.especie.nombre}\n` +
          `📅 Fecha de nacimiento: ${fechaNacimiento.toLocaleDateString()}\n` +
          `📆 Edad actual: ${Math.floor(edadMeses)} meses (${(edadMeses / 12).toFixed(1)} años)\n` +
          `⏳ Edad mínima requerida: ${edadMinimaMeses} meses (${(edadMinimaMeses / 12).toFixed(1)} años)\n\n` +
          `⚠️ Espere hasta que la hembra alcance la edad adecuada.`,
      );
    }
  }

  async validarPeriodoEsperaPostParto(hembra: AnimalFinca): Promise<void> {
    const ultimoParto = await this.partoRepository.findOne({
      where: { hembra: { id: hembra.id } },
      order: { fecha_parto: 'DESC' },
    });

    if (ultimoParto) {
      const fechaActual = new Date();
      const diasDesdeUltimoParto = Math.floor(
        (fechaActual.getTime() - ultimoParto.fecha_parto.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const config =
        ESPECIE_CONFIG[hembra.especie.nombre as keyof typeof ESPECIE_CONFIG];
      const periodoEspera = config?.periodoEsperaPostPartoDias || 45;

      if (diasDesdeUltimoParto < periodoEspera) {
        throw new BadRequestException(
          `⚠️ Período de espera post-parto no cumplido.\n\n` +
            `🐄 Especie: ${hembra.especie.nombre}\n` +
            `📅 Último parto: ${ultimoParto.fecha_parto.toLocaleDateString()}\n` +
            `⏳ Días transcurridos: ${diasDesdeUltimoParto}\n` +
            `⏰ Período de espera requerido: ${periodoEspera} días\n` +
            `📆 Días restantes: ${periodoEspera - diasDesdeUltimoParto}\n\n` +
            `❗ Espere el período de descanso recomendado antes de un nuevo servicio.`,
        );
      }
    }
  }

  async validarFechasGestacion(
    servicio: ServicioReproductivo,
    fechaParto: Date,
    especie: string,
  ): Promise<void> {
    const fechaServicio = new Date(servicio.fecha_servicio);
    const fechaPartoObj = new Date(fechaParto);

    const diasGestacion = Math.round(
      (fechaPartoObj.getTime() - fechaServicio.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];
    const periodoGestacion = config?.periodoGestacionDias || 283;
    const tolerancia = Math.round(periodoGestacion * 0.05);

    const minDias = periodoGestacion - tolerancia;
    const maxDias = periodoGestacion + tolerancia;

    if (diasGestacion < minDias || diasGestacion > maxDias) {
      const mensaje = `
⚠️ La fecha de parto no coincide con el período de gestación esperado.

📅 Fecha de servicio: ${fechaServicio.toLocaleDateString()}
🎯 Fecha de parto registrada: ${fechaPartoObj.toLocaleDateString()}
📊 Días de gestación calculados: ${diasGestacion} días

🐄 Período de gestación esperado: ${periodoGestacion} días (±${tolerancia} días)
✅ Rango aceptable: ${minDias} - ${maxDias} días

${diasGestacion < minDias ? '📉 Parto prematuro detectado' : '📈 Parto postérmino detectado'}

❗ Verifique la fecha de servicio y la fecha de parto.
`;

      if (diasGestacion < periodoGestacion * 0.7) {
        throw new BadRequestException(
          mensaje +
            '\n\n⚠️ ALERTA: Parto extremadamente prematuro. Verifique la fecha de servicio.',
        );
      }

      if (diasGestacion > periodoGestacion * 1.2) {
        throw new BadRequestException(
          mensaje +
            '\n\n⚠️ ALERTA: Parto extremadamente prolongado. Verifique la fecha de servicio.',
        );
      }

      throw new BadRequestException(mensaje);
    }
  }

  async validarNoDuplicadoFecha(
    hembraId: string,
    fechaParto: Date,
  ): Promise<void> {
    const inicioDia = new Date(fechaParto);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fechaParto);
    finDia.setHours(23, 59, 59, 999);

    const partoExistente = await this.partoRepository.findOne({
      where: {
        hembra: { id: hembraId },
        fecha_parto: Between(inicioDia, finDia),
      },
    });

    if (partoExistente) {
      throw new BadRequestException(
        `Ya existe un parto registrado para esta hembra en la fecha ${fechaParto.toLocaleDateString()}`,
      );
    }
  }

  async validarIntervaloEntrePartos(hembra: AnimalFinca): Promise<void> {
    const ultimoParto = await this.partoRepository.findOne({
      where: { hembra: { id: hembra.id } },
      order: { fecha_parto: 'DESC' },
    });

    if (ultimoParto) {
      const fechaActual = new Date();
      const diasDesdeUltimoParto = Math.floor(
        (fechaActual.getTime() - ultimoParto.fecha_parto.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const config =
        ESPECIE_CONFIG[hembra.especie.nombre as keyof typeof ESPECIE_CONFIG];
      const periodoGestacion = config?.periodoGestacionDias || 283;
      const intervaloMinimo = periodoGestacion + 30;

      if (diasDesdeUltimoParto < intervaloMinimo) {
        throw new BadRequestException(
          `⚠️ El intervalo mínimo entre partos es de ${intervaloMinimo} días.\n\n` +
            `📅 Último parto: ${ultimoParto.fecha_parto.toLocaleDateString()}\n` +
            `⏳ Días transcurridos: ${diasDesdeUltimoParto}\n` +
            `⏰ Días restantes: ${intervaloMinimo - diasDesdeUltimoParto}\n\n` +
            `❗ Espere el tiempo necesario antes de registrar otro parto.`,
        );
      }
    }
  }

  async validarNoPartoActivo(
    hembraId: string,
    fechaParto?: Date,
  ): Promise<void> {
    const partoActivo = await this.partoRepository.findOne({
      where: {
        hembra: { id: hembraId },
        estado: EstadoParto.EN_PROGRESO,
      },
    });

    if (partoActivo) {
      throw new BadRequestException(
        `La hembra tiene un parto en progreso (ID: ${partoActivo.id}). ` +
          `Debe completar o cancelar el parto actual antes de registrar uno nuevo.`,
      );
    }
  }

  async validarNoPartoProgramado(
    hembraId: string,
    fechaParto?: Date,
  ): Promise<void> {
    if (!fechaParto) return;

    const inicioSemana = new Date(fechaParto);
    inicioSemana.setDate(inicioSemana.getDate() - 7);

    const finSemana = new Date(fechaParto);
    finSemana.setDate(finSemana.getDate() + 7);

    const partoProgramado = await this.partoRepository.findOne({
      where: {
        hembra: { id: hembraId },
        estado: EstadoParto.PROGRAMADO,
        fecha_parto: Between(inicioSemana, finSemana),
      },
    });

    if (partoProgramado) {
      throw new BadRequestException(
        `Ya existe un parto programado para esta hembra en la semana del ${fechaParto.toLocaleDateString()}. ` +
          `ID del parto programado: ${partoProgramado.id}`,
      );
    }
  }

  validarNumeroCrias(
    numeroCrias: number,
    especie: string,
    crias?: any[],
  ): void {
    const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];
    const maxCrias = this.obtenerMaximoCrias(especie);

    if (numeroCrias < 1) {
      throw new BadRequestException('El número de crías debe ser al menos 1');
    }

    if (numeroCrias > maxCrias) {
      throw new BadRequestException(
        `El número máximo de crías por parto para ${especie} es ${maxCrias}. ` +
          `Registrado: ${numeroCrias} crías.`,
      );
    }

    if (crias && crias.length !== numeroCrias) {
      throw new BadRequestException(
        `El número de crías registradas (${crias.length}) no coincide con el número declarado (${numeroCrias})`,
      );
    }
  }

  private obtenerMaximoCrias(especie: string): number {
    const config: Record<string, number> = {
      Bovino: 2,
      Equino: 1,
      Porcino: 14,
      Ovino: 3,
      Caprino: 3,
    };
    return config[especie] || 2;
  }

  validarCrias(crias: any[], especie: string): void {
    const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];

    for (let i = 0; i < crias.length; i++) {
      const cria = crias[i];

      if (!Object.values(SexoCria).includes(cria.sexo)) {
        throw new BadRequestException(`Sexo inválido para la cría ${i + 1}`);
      }

      const pesoMinimo = this.obtenerPesoMinimo(especie);
      const pesoMaximo = this.obtenerPesoMaximo(especie);

      if (cria.peso < pesoMinimo || cria.peso > pesoMaximo) {
        throw new BadRequestException(
          `El peso de la cría ${i + 1} (${cria.peso} kg) está fuera del rango normal ` +
            `para ${especie} (${pesoMinimo}-${pesoMaximo} kg)`,
        );
      }

      if (!Object.values(EstadoCria).includes(cria.estado)) {
        throw new BadRequestException(`Estado inválido para la cría ${i + 1}`);
      }

      if (cria.fecha_nacimiento) {
        const fechaNacimiento = new Date(cria.fecha_nacimiento);
        const fechaActual = new Date();

        if (fechaNacimiento > fechaActual) {
          throw new BadRequestException(
            `La fecha de nacimiento de la cría ${i + 1} no puede ser futura`,
          );
        }

        const diasDiferencia = Math.floor(
          (fechaActual.getTime() - fechaNacimiento.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (diasDiferencia > 30) {
          console.warn(
            `⚠️ Cría ${i + 1} tiene ${diasDiferencia} días de nacida`,
          );
        }
      }
    }
  }

  private obtenerPesoMinimo(especie: string): number {
    const config: Record<string, number> = {
      Bovino: 25,
      Equino: 30,
      Porcino: 0.8,
      Ovino: 2,
      Caprino: 2,
    };
    return config[especie] || 1;
  }

  private obtenerPesoMaximo(especie: string): number {
    const config: Record<string, number> = {
      Bovino: 55,
      Equino: 60,
      Porcino: 2,
      Ovino: 5,
      Caprino: 5,
    };
    return config[especie] || 10;
  }

  async validarPartoSinServicio(
    hembra: AnimalFinca,
    fechaParto: Date,
  ): Promise<void> {
    const serviciosExitosos = await this.servicioRepository.find({
      where: {
        hembra: { id: hembra.id },
        exitoso: true,
      },
    });

    const serviciosConParto = await this.partoRepository.find({
      where: { hembra: { id: hembra.id } },
      relations: ['servicio_asociado'],
    });

    const servicioIdsConParto = serviciosConParto
      .map((p) => p.servicio_asociado?.id)
      .filter((id) => id);

    const serviciosSinParto = serviciosExitosos.filter(
      (s) => !servicioIdsConParto.includes(s.id),
    );

    if (serviciosSinParto.length > 0) {
      const servicioMasReciente = serviciosSinParto.sort(
        (a, b) => b.fecha_servicio.getTime() - a.fecha_servicio.getTime(),
      )[0];

      const config =
        ESPECIE_CONFIG[hembra.especie.nombre as keyof typeof ESPECIE_CONFIG];
      const periodoGestacion = config?.periodoGestacionDias || 283;

      const fechaEsperadaParto = new Date(servicioMasReciente.fecha_servicio);
      fechaEsperadaParto.setDate(
        fechaEsperadaParto.getDate() + periodoGestacion,
      );

      const diferenciaDias = Math.abs(
        Math.round(
          (fechaParto.getTime() - fechaEsperadaParto.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      throw new BadRequestException(
        `⚠️ Existe un servicio exitoso sin parto registrado.\n\n` +
          `📅 Fecha de servicio: ${servicioMasReciente.fecha_servicio.toLocaleDateString()}\n` +
          `🎯 Fecha estimada de parto: ${fechaEsperadaParto.toLocaleDateString()}\n` +
          `📆 Diferencia con fecha actual: ${diferenciaDias} días\n` +
          `🐄 Especie: ${hembra.especie.nombre}\n` +
          `📊 Período de gestación: ${periodoGestacion} días\n\n` +
          `❗ Por favor, registre el parto asociado a ese servicio antes de crear uno sin asociación.`,
      );
    }
  }

  async validarServicioSinParto(servicioId: string): Promise<void> {
    const partoExistente = await this.partoRepository.findOne({
      where: { servicio_asociado: { id: servicioId } },
    });

    if (partoExistente) {
      throw new BadRequestException(
        `Ya existe un parto registrado para este servicio (ID: ${partoExistente.id})`,
      );
    }
  }

  async validarActualizarParto(
    partoId: string,
    updates: Partial<PartoAnimal>,
  ): Promise<PartoAnimal> {
    const parto = await this.partoRepository.findOne({
      where: { id: partoId },
      relations: ['hembra', 'hembra.especie', 'servicio_asociado'],
    });

    if (!parto) {
      throw new NotFoundException('Parto no encontrado');
    }

    if (parto.estado === EstadoParto.COMPLETADO) {
      const camposCriticos = [
        'fecha_parto',
        'numero_crias',
        'tipo_parto',
        'crias',
      ];
      const modificandoCritico = camposCriticos.some(
        (campo) => updates[campo] !== undefined,
      );

      if (modificandoCritico) {
        throw new BadRequestException(
          'No se pueden modificar datos críticos de un parto ya completado. ' +
            'Solo se pueden agregar observaciones o registrar complicaciones.',
        );
      }
    }

    if (updates.fecha_parto) {
      await this.validarNoDuplicadoFecha(parto.hembra.id, updates.fecha_parto);

      if (parto.servicio_asociado) {
        await this.validarFechasGestacion(
          parto.servicio_asociado,
          updates.fecha_parto,
          parto.hembra.especie.nombre,
        );
      }
    }

    if (updates.crias && updates.crias.length > 0) {
      const numeroCrias = updates.numero_crias || parto.numero_crias;
      if (updates.crias.length > numeroCrias) {
        throw new BadRequestException(
          `El número de crías registradas (${updates.crias.length}) excede el número declarado (${numeroCrias})`,
        );
      }

      this.validarCrias(updates.crias, parto.hembra.especie.nombre);
    }

    return parto;
  }

  async validarEliminarParto(partoId: string): Promise<PartoAnimal> {
    const parto = await this.partoRepository.findOne({
      where: { id: partoId },
      relations: ['hembra'],
    });

    if (!parto) {
      throw new NotFoundException('Parto no encontrado');
    }

    const horasDesdeParto =
      (new Date().getTime() - parto.fecha_parto.getTime()) / (1000 * 60 * 60);

    if (horasDesdeParto > 24) {
      throw new BadRequestException(
        `No se puede eliminar un parto con más de 24 horas de registrado. ` +
          `Han pasado ${Math.floor(horasDesdeParto)} horas.`,
      );
    }

    return parto;
  }

  async validarComplicaciones(
    parto: PartoAnimal,
    complicaciones: string,
  ): Promise<void> {
    if (!complicaciones || complicaciones.trim() === '') {
      throw new BadRequestException('Debe especificar las complicaciones');
    }

    if (parto.estado === EstadoParto.COMPLETADO) {
      throw new BadRequestException(
        'No se pueden agregar complicaciones a un parto ya completado',
      );
    }
  }

  async validarTodasLasValidacionesParto(
    hembraId: string,
    servicioId?: string,
    fechaParto?: Date,
    numeroCrias?: number,
    crias?: any[],
  ): Promise<{ hembra: AnimalFinca; servicio: ServicioReproductivo | null }> {
    const { hembra, servicio } = await this.validarCrearParto(
      hembraId,
      servicioId,
      fechaParto,
    );

    if (numeroCrias) {
      this.validarNumeroCrias(numeroCrias, hembra.especie.nombre, crias);
    }

    if (crias && crias.length > 0) {
      this.validarCrias(crias, hembra.especie.nombre);
    }

    if (!servicioId) {
      await this.validarPartoSinServicio(hembra, fechaParto);
    }

    return { hembra, servicio };
  }

  private calcularEdadMeses(
    fechaNacimiento: Date | string,
    fechaActual: Date,
  ): number {
    const fechaNac = new Date(fechaNacimiento);

    const years = fechaActual.getFullYear() - fechaNac.getFullYear();
    const months = fechaActual.getMonth() - fechaNac.getMonth();

    return years * 12 + months;
  }

  //GESTACION
  calcularGestacionPorServicio(
    fechaServicio: Date,
    fechaParto: Date,
  ): { dias: number; semanas: number } {
    const fechaServicioObj = new Date(fechaServicio);
    const fechaPartoObj = new Date(fechaParto);

    const diasGestacion = Math.round(
      (fechaPartoObj.getTime() - fechaServicioObj.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const semanasGestacion = Math.round(diasGestacion / 7);

    return { dias: diasGestacion, semanas: semanasGestacion };
  }

  calcularGestacion(
    fechaServicio?: Date,
    fechaParto?: Date,
    especie?: string,
    diasIngresados?: number,
  ): { dias: number; semanas: number } {
    if (diasIngresados && diasIngresados > 0) {
      return {
        dias: diasIngresados,
        semanas: Math.round(diasIngresados / 7),
      };
    }

    if (fechaServicio && fechaParto) {
      return this.calcularGestacionPorServicio(fechaServicio, fechaParto);
    }

    if (especie) {
      const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];
      if (config) {
        return {
          dias: config.periodoGestacionDias,
          semanas: Math.round(config.periodoGestacionDias / 7),
        };
      }
    }

    return { dias: 285, semanas: 40 };
  }

  validarRangoGestacion(dias: number, especie: string): void {
    const config = ESPECIE_CONFIG[especie as keyof typeof ESPECIE_CONFIG];
    if (!config) return;

    const minDias =
      config.periodoGestacionMin || config.periodoGestacionDias * 0.95;
    const maxDias =
      config.periodoGestacionMax || config.periodoGestacionDias * 1.05;

    if (dias < minDias || dias > maxDias) {
      const mensaje = `
⚠️ El período de gestación calculado (${dias} días) está fuera del rango normal para ${especie}.
📊 Rango normal: ${Math.round(minDias)} - ${Math.round(maxDias)} días
📆 Período promedio: ${config.periodoGestacionDias} días

${dias < minDias ? '⚠️ Parto prematuro detectado' : '⚠️ Parto prolongado detectado'}

Por favor verifique las fechas ingresadas.
`;
      throw new BadRequestException(mensaje);
    }
  }
}
