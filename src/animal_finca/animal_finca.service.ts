import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAnimalFincaDto } from './dto/create-animal_finca.dto';
import {
  UpdateAnimalFincaDto,
  UpdateAvicolaFincaDto,
  UpdatePecesFincaDto,
} from './dto/update-animal_finca.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalFinca } from './entities/animal_finca.entity';
import { DataSource, EntityManager, In, Like, Repository } from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { UpdateDeathStatusDto } from './dto/update-death-status.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { NotificacionesAdminsService } from 'src/notificaciones_admins/notificaciones_admins.service';
import { NotificationType } from 'src/interfaces/nptificaciones.type';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { ImagesAminalesService } from 'src/images_aminales/images_aminales.service';
import * as XLSX from 'xlsx';
import { CreateAvicolaDto } from './dto/create-avicola.dto';
import { CreatePecesDto } from './dto/create-peces.dto';
@Injectable()
export class AnimalFincaService {
  constructor(
    @InjectRepository(AnimalFinca)
    private readonly animalRepo: Repository<AnimalFinca>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(FincasGanadero)
    private readonly fincaRepo: Repository<FincasGanadero>,
    @InjectRepository(EspecieAnimal)
    private readonly especieAnimal: Repository<EspecieAnimal>,
    @InjectRepository(RazaAnimal)
    private readonly razaAnimal: Repository<RazaAnimal>,
    private readonly notificacionesService: NotificacionesAdminsService,
    private serviceImagesAnimal: ImagesAminalesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createAnimalFincaDto: CreateAnimalFincaDto,
    cliente: Cliente,
    images: Express.Multer.File[],
  ) {
    const {
      color,
      especie,
      fincaId,
      identificador,
      propietarioId,
      razaIds,
      sexo,
      produccion,
      tipo_produccion,
      animal_muerte,
      razon_muerte,
      fecha_nacimiento,
      observaciones,
      tipo_alimentacion,
      castrado,
      esterelizado,
      complementos,
      medicamento,
      nombre_padre,
      arete_padre,
      razas_padre,
      pureza_padre,
      nombre_criador_padre,
      nombre_propietario_padre,
      nombre_finca_origen_padre,
      compra_animal,
      nombre_criador_origen_animal,
      nombre_madre,
      arete_madre,
      razas_madre,
      pureza_madre,
      nombre_criador_madre,
      nombre_propietario_madre,
      nombre_finca_origen_madre,
      numero_parto_madre,
      pureza,
      edad_promedio,
      nombre_animal,
      tipo_reproduccion,
      padreId,
      madreId,
      asegurado,
      condicion_corporal,
      desparasitado,
      historial_reproductivo,
      veterinario,
      nivel_entrenamiento,
      peso_actual,
      resultados_competencias,
      uso_equino,
      vacunas,
      valor_estimado,
      registro_genealogico,
      microchip,
      unidad_alzada,
      odontologia,
      alergias,
      alzada,
      lesiones,
      precio_compra,
    } = createAnimalFincaDto;

    try {
      let propietario: Cliente;
      let trabajador: Cliente | null = null;

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        propietario = cliente;

        if (propietarioId && propietarioId !== cliente.id) {
          const propietarioEncontrado = await this.clienteRepo.findOneBy({
            id: propietarioId,
          });
          if (!propietarioEncontrado) {
            throw new NotFoundException(`Propietario no encontrado`);
          }
          propietario = propietarioEncontrado;
        }
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        if (!cliente.propietario) {
          throw new BadRequestException(
            'El trabajador no tiene un propietario asignado',
          );
        }

        propietario = cliente.propietario;
        trabajador = cliente;

        const fincaAsignada = await this.fincaRepo
          .createQueryBuilder('finca')
          .innerJoin('finca.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .where('finca.id = :fincaId', { fincaId })
          .andWhere('trabajador.id = :trabajadorId', {
            trabajadorId: cliente.id,
          })
          .getOne();

        if (!fincaAsignada) {
          throw new UnauthorizedException(
            'No tienes permiso para agregar animales en esta finca',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
      }

      if (!propietario) {
        throw new NotFoundException(`Propietario no encontrado`);
      }

      // Buscar la finca
      const finca = await this.fincaRepo.findOne({
        where: { id: fincaId },
        relations: ['animales', 'propietario'],
      });

      if (!finca) {
        throw new NotFoundException(`Finca no encontrada`);
      }

      if (finca.propietario.id !== propietario.id) {
        throw new UnauthorizedException(
          'La finca no pertenece al propietario especificado',
        );
      }

      const especie_animal = await this.especieAnimal.findOneBy({
        id: especie,
      });
      if (!especie_animal) {
        throw new NotFoundException(`Especie no encontrada`);
      }

      if (!finca.especies_maneja) {
        finca.especies_maneja = [];
      }

      const configEspecie = finca.especies_maneja.find(
        (e) => e.especie === especie_animal.nombre,
      );

      if (configEspecie) {
        const animalesExistentes =
          finca.animales?.filter(
            (animal) =>
              animal.especie.id === especie &&
              !animal.animal_muerte &&
              !animal.animal_vendido,
          ).length || 0;

        const capacidadActual = configEspecie.cantidad;
        const capacidadDisponible = capacidadActual - animalesExistentes;

        const cantidadEntrante = 1;

        let incremento = 0;

        if (cantidadEntrante > capacidadDisponible) {
          incremento = cantidadEntrante - capacidadDisponible;
        }

        if (incremento > 0) {
          finca.especies_maneja = finca.especies_maneja.map((e) =>
            e.especie === especie_animal.nombre
              ? {
                  ...e,
                  cantidad: e.cantidad + incremento,
                }
              : e,
          );

          await this.fincaRepo.save(finca);
        }
      } else {
        finca.especies_maneja.push({
          especie: especie_animal.nombre,
          cantidad: 1,
        });

        await this.fincaRepo.save(finca);
      }

      const razas = await this.razaAnimal.findBy({ id: In(razaIds) });
      if (razas.length !== razaIds.length) {
        throw new NotFoundException('Una o más razas no fueron encontradas.');
      }

      if (!razaIds || razaIds.length === 0 || razaIds.length > 2) {
        throw new BadRequestException(
          'Debes ingresar al menos una raza y como máximo dos.',
        );
      }

      let razasPadre = [];
      if (razas_padre && Array.isArray(razas_padre) && razas_padre.length > 0) {
        razasPadre = await this.razaAnimal.findBy({ id: In(razas_padre) });
        if (razasPadre.length !== razas_padre.length) {
          throw new NotFoundException(
            'Una o más razas del padre no fueron encontradas.',
          );
        }
      }

      let razasMadre = [];
      if (razas_madre && Array.isArray(razas_madre) && razas_madre.length > 0) {
        razasMadre = await this.razaAnimal.findBy({ id: In(razas_madre) });
        if (razasMadre.length !== razas_madre.length) {
          throw new NotFoundException(
            'Una o más razas de la madre no fueron encontradas.',
          );
        }
      }

      const existeIdentificador = await this.animalRepo.findOneBy({
        identificador,
      });
      if (existeIdentificador) {
        throw new ConflictException('El identificador ya está en uso');
      }

      if (tipo_alimentacion) {
        for (const alimentacion of tipo_alimentacion) {
          if (alimentacion.origen === 'comprado y producido') {
            const porcentaje_comprado = alimentacion.porcentaje_comprado ?? 0;
            const porcentaje_producido = alimentacion.porcentaje_producido ?? 0;
            const total = porcentaje_comprado + porcentaje_producido;

            if (total !== 100) {
              throw new BadRequestException(
                `El alimento "${alimentacion.alimento}" tiene porcentajes que no suman 100%. Comprado: ${porcentaje_comprado}%, Producido: ${porcentaje_producido}%`,
              );
            }
          }
        }
      }

      let padreAnimal: AnimalFinca | null = null;
      let madreAnimal: AnimalFinca | null = null;
      if (padreId) {
        padreAnimal = await this.animalRepo.findOne({
          where: { id: padreId },
          relations: ['razas', 'propietario', 'finca'],
        });

        if (!padreAnimal) {
          throw new BadRequestException('No se encontró el padre seleccionado');
        }

        if (padreAnimal.sexo !== 'Macho') {
          throw new BadRequestException(
            'El animal seleccionado como padre debe ser macho',
          );
        }
      }

      if (madreId) {
        madreAnimal = await this.animalRepo.findOne({
          where: { id: madreId },
          relations: ['razas', 'propietario', 'finca'],
        });

        if (!madreAnimal) {
          throw new BadRequestException('No se encontró la madre seleccionada');
        }

        if (madreAnimal.sexo !== 'Hembra') {
          throw new BadRequestException(
            'El animal seleccionado como madre debe ser hembra',
          );
        }
      }

      const nuevoAnimal = this.animalRepo.create({
        color,
        especie: especie_animal,
        identificador,
        razas,
        sexo,
        produccion,
        tipo_produccion,
        edad_promedio,
        fecha_nacimiento,
        observaciones,
        propietario,
        trabajador,
        creado_por: cliente,
        finca,
        castrado,
        esterelizado,
        tipo_alimentacion,
        animal_muerte,
        razon_muerte,
        complementos,
        medicamento,
        pureza,
        tipo_reproduccion,
        compra_animal,
        nombre_criador_origen_animal,
        padre: padreAnimal,
        madre: madreAnimal,
        nombre_padre: padreAnimal?.nombre_animal ?? nombre_padre,
        arete_padre: padreAnimal?.identificador ?? arete_padre,
        razas_padre: padreAnimal?.razas ?? razasPadre,
        pureza_padre: padreAnimal?.pureza ?? pureza_padre,
        nombre_propietario_padre:
          padreAnimal?.propietario?.nombre ?? nombre_propietario_padre,
        nombre_finca_origen_padre:
          padreAnimal?.finca?.nombre_finca ?? nombre_finca_origen_padre,
        nombre_criador_padre:
          padreAnimal?.nombre_criador_padre ?? nombre_criador_padre,

        nombre_madre: madreAnimal?.nombre_animal ?? nombre_madre,
        arete_madre: madreAnimal?.identificador ?? arete_madre,
        razas_madre: madreAnimal?.razas ?? razasMadre,
        pureza_madre: madreAnimal?.pureza ?? pureza_madre,
        nombre_propietario_madre:
          madreAnimal?.propietario?.nombre ?? nombre_propietario_madre,
        nombre_finca_origen_madre:
          madreAnimal?.finca?.nombre_finca ?? nombre_finca_origen_madre,
        numero_parto_madre: numero_parto_madre,
        nombre_criador_madre:
          madreAnimal?.nombre_criador_madre ?? nombre_criador_madre,
        nombre_animal,
        asegurado,
        condicion_corporal,
        desparasitado,
        historial_reproductivo,
        veterinario,
        nivel_entrenamiento,
        peso_actual,
        resultados_competencias,
        uso_equino,
        vacunas,
        valor_estimado,
        registro_genealogico,
        microchip,
        unidad_alzada,
        odontologia,
        alergias,
        alzada,
        lesiones,
        precio_compra,
      });

      await this.animalRepo.save(nuevoAnimal);

      const uploadedImages = [];
      if (images && images.length > 0) {
        for (const image of images) {
          try {
            const uploadedImage =
              await this.serviceImagesAnimal.uploadProfileImage(
                nuevoAnimal.id,
                image,
              );
            uploadedImages.push(uploadedImage);
          } catch (imageError) {
            console.error(
              `Error al subir imagen para animal ${nuevoAnimal.id}:`,
              imageError,
            );
          }
        }
      }

      const creadorNombre =
        cliente.rol === TipoCliente.TRABAJADOR
          ? `el trabajador ${cliente.nombre} (del ganadero ${propietario.nombre})`
          : `el ganadero ${propietario.nombre}`;

      await this.notificacionesService.notifyAdmins(
        NotificationType.NEW_ANIMAL,
        'Nuevo Animal Registrado',
        `Se ha ingresado un nuevo animal con el arete: ${nuevoAnimal.identificador}, en la finca ${nuevoAnimal.finca.nombre_finca}, por ${creadorNombre}`,
      );

      return {
        message: 'Animal creado exitosamente',
        animal: {
          id: nuevoAnimal.id,
          identificador: nuevoAnimal.identificador,
          propietario: propietario.nombre,
          trabajador: trabajador?.nombre || null,
          finca: finca.nombre_finca,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async createAvicola(
    createAvicolaDto: CreateAvicolaDto,
    cliente: Cliente,
    images: Express.Multer.File[],
  ) {
    const {
      especie,
      fincaId,
      identificador,
      razaIds,
      tipo_produccion,
      tipo_alimentacion,
      cantidad_lote,
      tipo_ave,
      proveedor_aves,
      galpon,
      mortalidad_diaria,
      consumo_alimento,
      consumo_agua,
      peso_promedio,
      huevos_diarios,
      huevos_rotos,
      calificacion_huevos,
      vacunas_lote,
      tratamientos,
      porcentaje_postura,
      tipo_concentrado,
      fecha_postura,
      lote_activo,
    } = createAvicolaDto;

    try {
      let propietario: Cliente;
      let trabajador: Cliente | null = null;

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        propietario = cliente;
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        if (!cliente.propietario) {
          throw new BadRequestException(
            'El trabajador no tiene un propietario asignado',
          );
        }
        propietario = cliente.propietario;
        trabajador = cliente;

        const fincaAsignada = await this.fincaRepo
          .createQueryBuilder('finca')
          .innerJoin('finca.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .where('finca.id = :fincaId', { fincaId })
          .andWhere('trabajador.id = :trabajadorId', {
            trabajadorId: cliente.id,
          })
          .getOne();

        if (!fincaAsignada) {
          throw new UnauthorizedException(
            'No tienes permiso para agregar aves en esta finca',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
      }

      if (!propietario) {
        throw new NotFoundException('Propietario no encontrado');
      }

      const finca = await this.fincaRepo.findOne({
        where: { id: fincaId },
        relations: ['propietario', 'animales'],
      });

      if (!finca) {
        throw new NotFoundException('Finca no encontrada');
      }

      if (finca.propietario.id !== propietario.id) {
        throw new UnauthorizedException(
          'La finca no pertenece al propietario especificado',
        );
      }

      const especieAnimal = await this.especieAnimal.findOne({
        where: { id: especie },
      });
      if (!especieAnimal) {
        throw new NotFoundException('Especie no encontrada');
      }

      if (finca.especies_maneja && finca.especies_maneja.length > 0) {
        const configEspecie = finca.especies_maneja.find(
          (e) => e.especie === especieAnimal.nombre,
        );

        if (configEspecie) {
          const avesExistentes =
            finca.animales
              ?.filter(
                (animal) =>
                  animal.especie.id === especie &&
                  !animal.animal_muerte &&
                  !animal.animal_vendido &&
                  animal.cantidad_lote &&
                  animal.lote_activo,
              )
              ?.reduce(
                (total, animal) => total + (animal.cantidad_lote || 0),
                0,
              ) || 0;

          const capacidadActual = configEspecie.cantidad;
          const capacidadDisponible = capacidadActual - avesExistentes;

          let incremento = 0;

          if ((cantidad_lote || 0) > capacidadDisponible) {
            incremento = (cantidad_lote || 0) - capacidadDisponible;
          }

          if (incremento > 0) {
            finca.especies_maneja = finca.especies_maneja.map((e) =>
              e.especie === especieAnimal.nombre
                ? {
                    ...e,
                    cantidad: e.cantidad + incremento,
                  }
                : e,
            );

            await this.fincaRepo.save(finca);
          }
        } else {
          finca.especies_maneja.push({
            especie: especieAnimal.nombre,
            cantidad: cantidad_lote || 0,
          });

          await this.fincaRepo.save(finca);
        }
      }

      const razas = await this.razaAnimal.findBy({ id: In(razaIds) });
      if (razas.length !== razaIds.length) {
        throw new NotFoundException('Una o más razas no fueron encontradas.');
      }

      if (!razaIds || razaIds.length === 0 || razaIds.length > 2) {
        throw new BadRequestException(
          'Debes ingresar al menos una raza y como máximo dos.',
        );
      }

      const existeIdentificador = await this.animalRepo.findOne({
        where: { identificador },
      });
      if (existeIdentificador) {
        throw new ConflictException(
          'El identificador del galpón ya está en uso',
        );
      }

      if (tipo_alimentacion) {
        for (const alimentacion of tipo_alimentacion) {
          if (alimentacion.origen === 'comprado y producido') {
            const porcentaje_comprado = alimentacion.porcentaje_comprado ?? 0;
            const porcentaje_producido = alimentacion.porcentaje_producido ?? 0;
            const total = porcentaje_comprado + porcentaje_producido;

            if (total !== 100) {
              throw new BadRequestException(
                `El alimento "${alimentacion.alimento}" tiene porcentajes que no suman 100%. Comprado: ${porcentaje_comprado}%, Producido: ${porcentaje_producido}%`,
              );
            }
          }
        }
      }

      const nuevoAvicola = this.animalRepo.create({
        especie: especieAnimal,
        identificador,
        razas,
        tipo_produccion,
        tipo_alimentacion,
        cantidad_lote,
        tipo_ave,
        proveedor_aves,
        galpon,
        mortalidad_diaria,
        consumo_alimento,
        consumo_agua,
        peso_promedio,
        huevos_diarios,
        huevos_rotos,
        calificacion_huevos,
        vacunas_lote,
        tratamientos,
        porcentaje_postura,
        tipo_concentrado,
        fecha_postura,
        propietario,
        trabajador,
        creado_por: cliente,
        finca,
        lote_activo,
      });

      await this.animalRepo.save(nuevoAvicola);

      const uploadedImages = [];
      if (images && images.length > 0) {
        for (const image of images) {
          try {
            const uploadedImage =
              await this.serviceImagesAnimal.uploadProfileImage(
                nuevoAvicola.id,
                image,
              );
            uploadedImages.push(uploadedImage);
          } catch (imageError) {
            console.error(
              `Error al subir imagen para avícola ${nuevoAvicola.id}:`,
              imageError,
            );
          }
        }
      }

      const creadorNombre =
        cliente.rol === TipoCliente.TRABAJADOR
          ? `el trabajador ${cliente.nombre} (del ganadero ${propietario.nombre})`
          : `el ganadero ${propietario.nombre}`;

      await this.notificacionesService.notifyAdmins(
        NotificationType.NEW_ANIMAL,
        'Nuevo Lote Avícola Registrado',
        `Se ha registrado un nuevo lote avícola con identificador: ${nuevoAvicola.identificador}, ` +
          `en la finca ${finca.nombre_finca}, por ${creadorNombre}. ` +
          `Cantidad: ${cantidad_lote || 'No especificada'} aves.`,
      );

      return {
        message: 'Lote avícola creado exitosamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async createPeces(
    createPecesDto: CreatePecesDto,
    cliente: Cliente,
    images: Express.Multer.File[],
  ) {
    const {
      especie,
      fincaId,
      identificador,
      razaIds,
      estanque_tanque_jaula,
      proveedor_alevines,
      fecha_siembra,
      cantidad_inicial,
      talla_peso_inicial,
      densidad_por_m3_m2,
      cantidad_actual,
      mortalidad_diaria_acum,
      muestreos,
      etapa,
      peso_promedio,
      biomasa_estimada,
      talla,
      fecha_muestreo,
      calidad_agua,
      tipo_concentrado,
      proteina_porcentaje,
      racion_diaria,
      consumo,
      conversion_alimenticia,
      sanidad,
      cosecha,
      lote_activo,
    } = createPecesDto;

    try {
      let propietario: Cliente;
      let trabajador: Cliente | null = null;

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        propietario = cliente;
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        if (!cliente.propietario) {
          throw new BadRequestException(
            'El trabajador no tiene un propietario asignado',
          );
        }
        propietario = cliente.propietario;
        trabajador = cliente;

        const fincaAsignada = await this.fincaRepo
          .createQueryBuilder('finca')
          .innerJoin('finca.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .where('finca.id = :fincaId', { fincaId })
          .andWhere('trabajador.id = :trabajadorId', {
            trabajadorId: cliente.id,
          })
          .getOne();

        if (!fincaAsignada) {
          throw new UnauthorizedException(
            'No tienes permiso para agregar peces en esta finca',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
      }

      if (!propietario) {
        throw new NotFoundException('Propietario no encontrado');
      }

      const finca = await this.fincaRepo.findOne({
        where: { id: fincaId },
        relations: ['propietario', 'animales'],
      });

      if (!finca) {
        throw new NotFoundException('Finca no encontrada');
      }

      if (finca.propietario.id !== propietario.id) {
        throw new UnauthorizedException(
          'La finca no pertenece al propietario especificado',
        );
      }

      const especieAnimal = await this.especieAnimal.findOne({
        where: { id: especie },
      });
      if (!especieAnimal) {
        throw new NotFoundException('Especie no encontrada');
      }

      if (finca.especies_maneja && finca.especies_maneja.length > 0) {
        const configEspecie = finca.especies_maneja.find(
          (e) => e.especie === especieAnimal.nombre,
        );

        if (configEspecie) {
          const pecesExistentes =
            finca.animales
              ?.filter(
                (animal) =>
                  animal.especie.id === especie &&
                  !animal.animal_muerte &&
                  !animal.animal_vendido &&
                  animal.lote_activo,
              )
              ?.reduce(
                (total, animal) => total + (animal.cantidad_inicial || 0),
                0,
              ) || 0;

          const capacidadActual = configEspecie.cantidad;
          const capacidadDisponible = capacidadActual - pecesExistentes;

          let incremento = 0;

          if ((cantidad_inicial || 0) > capacidadDisponible) {
            incremento = (cantidad_inicial || 0) - capacidadDisponible;
          }

          if (incremento > 0) {
            finca.especies_maneja = finca.especies_maneja.map((e) =>
              e.especie === especieAnimal.nombre
                ? {
                    ...e,
                    cantidad: e.cantidad + incremento,
                  }
                : e,
            );

            await this.fincaRepo.save(finca);
          }
        } else {
          finca.especies_maneja.push({
            especie: especieAnimal.nombre,
            cantidad: cantidad_inicial || 0,
          });

          await this.fincaRepo.save(finca);
        }
      }

      const razas = await this.razaAnimal.findBy({ id: In(razaIds) });
      if (razas.length !== razaIds.length) {
        throw new NotFoundException('Una o más razas no fueron encontradas.');
      }

      if (!razaIds || razaIds.length === 0 || razaIds.length > 2) {
        throw new BadRequestException(
          'Debes ingresar al menos una raza y como máximo dos.',
        );
      }

      const existeIdentificador = await this.animalRepo.findOne({
        where: { identificador },
      });
      if (existeIdentificador) {
        throw new ConflictException('El identificador del lote ya está en uso');
      }

      if (fecha_siembra) {
        const fechaSiembra = new Date(fecha_siembra);
        const ahora = new Date();
        if (fechaSiembra > ahora) {
          throw new BadRequestException(
            'La fecha de siembra no puede ser futura',
          );
        }
      }

      if (calidad_agua) {
        if (calidad_agua.temperatura !== undefined) {
          if (calidad_agua.temperatura < 0 || calidad_agua.temperatura > 40) {
            throw new BadRequestException(
              'La temperatura debe estar entre 0°C y 40°C',
            );
          }
        }
        if (calidad_agua.ph !== undefined) {
          if (calidad_agua.ph < 0 || calidad_agua.ph > 14) {
            throw new BadRequestException('El pH debe estar entre 0 y 14');
          }
        }
      }

      const nuevoPez = this.animalRepo.create({
        especie: especieAnimal,
        identificador,
        razas,
        propietario,
        trabajador,
        creado_por: cliente,
        finca,
        lote_activo: lote_activo !== undefined ? lote_activo : true,

        estanque_tanque_jaula,
        proveedor_alevines,

        fecha_siembra: fecha_siembra ? new Date(fecha_siembra) : undefined,
        cantidad_inicial,
        talla_peso_inicial,
        densidad_por_m3_m2,

        cantidad_actual,
        mortalidad_diaria_acum,
        muestreos: muestreos || [],
        etapa,

        peso_promedio_pez: peso_promedio,
        biomasa_estimada,
        talla_pez: talla,
        fecha_muestreo_pez: fecha_muestreo
          ? new Date(fecha_muestreo)
          : undefined,
        calidad_agua: calidad_agua || {},
        tipo_concentrado_pez: tipo_concentrado,
        proteina_porcentaje,
        racion_diaria,
        consumo_pez: consumo,
        conversion_alimenticia,
        sanidad: sanidad || {},
        cosecha: cosecha || {},
        animal_muerte: false,
        animal_vendido: false,
      });

      await this.animalRepo.save(nuevoPez);

      const uploadedImages = [];
      if (images && images.length > 0) {
        for (const image of images) {
          try {
            const uploadedImage =
              await this.serviceImagesAnimal.uploadProfileImage(
                nuevoPez.id,
                image,
              );
            uploadedImages.push(uploadedImage);
          } catch (imageError) {
            console.error(
              `Error al subir imagen para pez ${nuevoPez.id}:`,
              imageError,
            );
          }
        }
      }

      const creadorNombre =
        cliente.rol === TipoCliente.TRABAJADOR
          ? `el trabajador ${cliente.nombre} (del ganadero ${propietario.nombre})`
          : `el ganadero ${propietario.nombre}`;

      await this.notificacionesService.notifyAdmins(
        NotificationType.NEW_ANIMAL,
        'Nuevo Lote de Peces Registrado',
        `Se ha registrado un nuevo lote de peces con identificador: ${nuevoPez.identificador}, ` +
          `en la finca ${finca.nombre_finca}, por ${creadorNombre}. ` +
          `Cantidad inicial: ${cantidad_inicial || 'No especificada'} peces.`,
      );

      return {
        message: 'Lote de peces creado exitosamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async cargaMasiva(
    cliente: Cliente,
    file: Express.Multer.File,
    fincaId: string,
    especieId: string,
    razaId: string,
  ) {
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any>(worksheet);

    if (!data || data.length === 0) {
      throw new BadRequestException('El archivo no contiene datos');
    }

    const finca = await this.fincaRepo.findOne({
      where: {
        id: fincaId,
      },
    });

    if (!finca) {
      throw new NotFoundException('Finca no encontrada');
    }

    const especie = await this.especieAnimal.findOne({
      where: {
        id: especieId,
      },
    });

    if (!especie) {
      throw new NotFoundException('Especie no encontrada');
    }

    const raza = await this.razaAnimal.findOne({
      where: {
        id: razaId,
      },
    });

    if (!raza) {
      throw new NotFoundException('Raza no encontrada');
    }

    if (!raza.abreviatura) {
      throw new BadRequestException(
        'La raza seleccionada no tiene una abreviatura definida',
      );
    }

    const getIdentifierPrefix = (sexo: string) => {
      const especieCode = especie.nombre.slice(0, 2).toUpperCase();
      const razaCode = raza.abreviatura.toUpperCase();
      const sexoCode = sexo === 'Macho' ? '1' : '2';
      return `${especieCode}${razaCode}${sexoCode}`;
    };

    const generateUniqueNumber = (): string => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1) + min).toString();
    };

    const generateIdentifier = (
      prefix: string,
      uniqueNumber: string,
    ): string => {
      return `${prefix}-${uniqueNumber}`;
    };

    return this.dataSource.transaction(async (manager) => {
      const animales: AnimalFinca[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      const animalesPorSexo: { [key: string]: any[] } = {
        Macho: [],
        Hembra: [],
      };

      const normalizeToString = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (value instanceof Date) return value.toISOString().split('T')[0];
        return String(value).trim();
      };

      const normalizeSexo = (value: any): string => {
        const sexoStr = normalizeToString(value).toLowerCase();
        if (sexoStr === 'macho' || sexoStr === 'm') return 'Macho';
        if (
          sexoStr === 'hembra' ||
          sexoStr === 'h' ||
          sexoStr === 'femenino' ||
          sexoStr === 'f'
        )
          return 'Hembra';
        return sexoStr;
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2;

        const nombreAnimal = normalizeToString(row.nombre_animal);
        const sexoRaw = row.sexo;
        const fechaNacimientoRaw = row.fecha_nacimiento;
        const edadPromedioRaw = row.edad_promedio;
        const nombrePadre = normalizeToString(row.nombre_padre);
        const nombreMadre = normalizeToString(row.nombre_madre);

        if (!nombreAnimal) {
          errors.push({
            row: rowNumber,
            error: 'nombre_animal es requerido',
          });
          continue;
        }

        if (!sexoRaw) {
          errors.push({
            row: rowNumber,
            error: 'sexo es requerido',
          });
          continue;
        }

        const sexoNormalizado = normalizeSexo(sexoRaw);
        if (sexoNormalizado !== 'Macho' && sexoNormalizado !== 'Hembra') {
          errors.push({
            row: rowNumber,
            error: `sexo debe ser "Macho" o "Hembra". Valor recibido: "${sexoRaw}"`,
          });
          continue;
        }

        let fechaNacimiento = null;
        if (fechaNacimientoRaw) {
          let date: Date;

          if (typeof fechaNacimientoRaw === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            date = new Date(
              excelEpoch.getTime() + fechaNacimientoRaw * 86400000,
            );
          } else {
            date = new Date(fechaNacimientoRaw);
          }

          if (isNaN(date.getTime())) {
            errors.push({
              row: rowNumber,
              error: `fecha_nacimiento inválida. Valor recibido: "${fechaNacimientoRaw}"`,
            });
            continue;
          }
          fechaNacimiento = date;
        }

        let edadPromedio: number;
        if (typeof edadPromedioRaw === 'string') {
          edadPromedio = parseFloat(edadPromedioRaw.replace(',', '.'));
        } else if (typeof edadPromedioRaw === 'number') {
          edadPromedio = edadPromedioRaw;
        } else {
          edadPromedio = NaN;
        }

        if (isNaN(edadPromedio)) {
          errors.push({
            row: rowNumber,
            error: `edad_promedio debe ser un número. Valor recibido: "${edadPromedioRaw}"`,
          });
          continue;
        }

        animalesPorSexo[sexoNormalizado].push({
          row,
          rowNumber,
          nombre_animal: nombreAnimal,
          sexo: sexoNormalizado,
          fecha_nacimiento: fechaNacimiento,
          edad_promedio: edadPromedio,
          nombre_padre: nombrePadre || 'N/D',
          nombre_madre: nombreMadre || 'N/D',
        });
      }

      if (errors.length > 0) {
        throw new BadRequestException({
          message: 'Errores en el archivo',
          errors: errors,
        });
      }

      if (
        animalesPorSexo.Macho.length === 0 &&
        animalesPorSexo.Hembra.length === 0
      ) {
        throw new BadRequestException('No hay animales válidos para cargar');
      }

      const usedIdentifiers = new Set<string>();

      const existingIdentifiers = await manager.find(AnimalFinca, {
        select: ['identificador'],
      });
      existingIdentifiers.forEach((animal) => {
        if (animal.identificador) {
          usedIdentifiers.add(animal.identificador);
        }
      });

      const generateUniqueIdentifier = (prefix: string): string => {
        let attempts = 0;
        const maxAttempts = 1000;

        while (attempts < maxAttempts) {
          const uniqueNumber = generateUniqueNumber();
          const identifier = generateIdentifier(prefix, uniqueNumber);

          if (!usedIdentifiers.has(identifier)) {
            usedIdentifiers.add(identifier);
            return identifier;
          }
          attempts++;
        }

        throw new BadRequestException(
          `No se pudo generar un identificador único para el prefijo ${prefix}`,
        );
      };

      const machoPrefix = getIdentifierPrefix('Macho');
      for (const animalData of animalesPorSexo.Macho) {
        const identificador = generateUniqueIdentifier(machoPrefix);

        const animal = manager.create(AnimalFinca, {
          nombre_animal: animalData.nombre_animal,
          sexo: animalData.sexo,
          propietario: cliente,
          fecha_nacimiento: animalData.fecha_nacimiento,
          edad_promedio: animalData.edad_promedio,
          nombre_padre: animalData.nombre_padre,
          nombre_madre: animalData.nombre_madre,
          especie,
          finca,
          razas: [raza],
          identificador,
          produccion: 'N/D',
          tipo_produccion: 'N/D',
          tipo_alimentacion: [],
          complementos: [],
        });

        animales.push(animal);
      }

      const hembraPrefix = getIdentifierPrefix('Hembra');
      for (const animalData of animalesPorSexo.Hembra) {
        const identificador = generateUniqueIdentifier(hembraPrefix);

        const animal = manager.create(AnimalFinca, {
          nombre_animal: animalData.nombre_animal,
          sexo: animalData.sexo,
          propietario: cliente,
          fecha_nacimiento: animalData.fecha_nacimiento,
          edad_promedio: animalData.edad_promedio,
          nombre_padre: animalData.nombre_padre,
          nombre_madre: animalData.nombre_madre,
          especie,
          finca,
          razas: [raza],
          identificador,
          produccion: 'N/D',
          tipo_produccion: 'N/D',
          tipo_alimentacion: [],
          complementos: [],
        });

        animales.push(animal);
      }

      await manager.save(animales);

      return {
        total: animales.length,
        machos: animalesPorSexo.Macho.length,
        hembras: animalesPorSexo.Hembra.length,
        message: 'Carga masiva realizada correctamente',
      };
    });
  }

  async findAll(
    cliente: Cliente,
    propietarioId: string,
    paginationDto: PaginationDto,
  ) {
    const {
      fincaId,
      identificador,
      especieId,
      limit = 6,
      offset = 0,
      name,
    } = paginationDto;

    try {
      if (propietarioId) {
        const propietario = await this.clienteRepo.findOne({
          where: { id: propietarioId },
        });

        if (!propietario) {
          throw new NotFoundException(
            'No se encontró el propietario seleccionado.',
          );
        }
      }

      const query = this.animalRepo
        .createQueryBuilder('animal')
        .leftJoinAndSelect('animal.finca', 'finca')
        .leftJoinAndSelect('animal.propietario', 'propietario')
        .leftJoinAndSelect('animal.especie', 'especie')
        .leftJoinAndSelect('animal.razas', 'razas')
        .leftJoinAndSelect('animal.razas_madre', 'razas_madre')
        .leftJoinAndSelect('animal.razas_padre', 'razas_padre')
        .leftJoinAndSelect('animal.profileImages', 'profileImages')
        .where('animal.animal_muerte = :animal_muerte', {
          animal_muerte: false,
        })
        .andWhere('animal.animal_vendido = :animal_vendido', {
          animal_vendido: false,
        });

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        query.andWhere('animal.propietarioId = :clienteId', {
          clienteId: cliente.id,
        });
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        query
          .innerJoin('animal.finca', 'fincaTrabajador')
          .innerJoin('fincaTrabajador.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .andWhere('trabajador.id = :clienteId', {
            clienteId: cliente.id,
          });
      }

      if (propietarioId && cliente.rol === TipoCliente.PROPIETARIO) {
        query.andWhere('animal.propietarioId = :propietarioId', {
          propietarioId,
        });
      }

      if (fincaId) {
        query.andWhere('animal.fincaId = :fincaId', { fincaId });
      }

      if (identificador && identificador.trim() !== '') {
        const searchTerm = identificador.trim();
        query.andWhere(
          '(LOWER(animal.identificador) LIKE :searchTerm OR LOWER(animal.nombre_animal) LIKE :searchTerm)',
          { searchTerm: `%${searchTerm.toLowerCase()}%` },
        );
      }

      if (
        name &&
        name.trim() !== '' &&
        (!identificador || identificador.trim() === '')
      ) {
        const searchTerm = name.trim();
        query.andWhere(
          '(LOWER(animal.identificador) LIKE :searchTerm OR LOWER(animal.nombre_animal) LIKE :searchTerm)',
          { searchTerm: `%${searchTerm.toLowerCase()}%` },
        );
      }
      if (especieId) {
        query.andWhere('animal.especieId = :especieId', { especieId });
      }

      const total = await query.getCount();

      const animales = await query
        .orderBy('animal.fecha_registro', 'DESC')
        .addOrderBy('profileImages.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      if (!animales || animales.length === 0) {
        return {
          data: [],
          total: 0,
          limit,
          offset,
        };
      }

      const animalesConImagenesOrdenadas = animales.map((animal) => ({
        ...animal,
        profileImages:
          animal.profileImages?.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ) || [],
      }));

      return instanceToPlain({
        data: animalesConImagenesOrdenadas,
        total,
        limit,
        offset,
      });
    } catch (error) {
      throw error;
    }
  }

  async findAllAnimales(cliente: Cliente, paginationDto: PaginationDto) {
    const { sexo, especieId } = paginationDto;
    try {
      const propietarioId = getPropietarioId(cliente);

      const query = this.animalRepo
        .createQueryBuilder('animal')
        .leftJoinAndSelect('animal.finca', 'finca')
        .leftJoinAndSelect('animal.propietario', 'propietario')
        .leftJoinAndSelect('animal.especie', 'especie')
        .leftJoinAndSelect('animal.razas', 'razas')
        .leftJoinAndSelect('animal.razas_madre', 'razas_madre')
        .leftJoinAndSelect('animal.razas_padre', 'razas_padre')
        .leftJoinAndSelect('animal.profileImages', 'profileImages')
        .where('animal.animal_muerte = :animal_muerte', {
          animal_muerte: false,
        })
        .andWhere('animal.animal_vendido = :animal_vendido', {
          animal_vendido: false,
        });

      if (sexo) {
        query.andWhere('LOWER(animal.sexo) = LOWER(:sexo)', {
          sexo,
        });
      }

      if (especieId) {
        query.andWhere('especie.id = :especieId', {
          especieId,
        });
      }

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        query.andWhere('animal.propietarioId = :propietarioId', {
          propietarioId,
        });
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        query
          .innerJoin('animal.finca', 'fincaTrabajador')
          .innerJoin('fincaTrabajador.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .andWhere('trabajador.id = :clienteId', {
            clienteId: cliente.id,
          });
      }

      const animales = await query
        .orderBy('animal.fecha_registro', 'DESC')
        .addOrderBy('profileImages.createdAt', 'DESC')
        .getMany();

      const animalesConImagenesOrdenadas = animales.map((animal) => ({
        ...animal,
        profileImages:
          animal.profileImages?.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ) || [],
      }));

      return instanceToPlain(animalesConImagenesOrdenadas);
    } catch (error) {
      throw error;
    }
  }

  async findAllAnimalesByFincaRaza(
    fincaId: string,
    especieId: string,
    razaId: string,
  ) {
    try {
      const animales = await this.animalRepo
        .createQueryBuilder('animal')
        .leftJoinAndSelect('animal.finca', 'finca')
        .leftJoinAndSelect('animal.especie', 'especie')
        .leftJoinAndSelect('animal.razas', 'razas')
        .leftJoinAndSelect('animal.propietario', 'propietario')
        .leftJoinAndSelect('animal.profileImages', 'profileImages')
        .where('finca.id = :fincaId', { fincaId })
        .andWhere('especie.id = :especieId', { especieId })
        .andWhere('razas.id = :razaId', { razaId })
        .andWhere('animal.animal_vendido = :animal_vendido', {
          animal_vendido: false,
        })
        .andWhere('animal.animal_muerte = :animal_muerte', {
          animal_muerte: false,
        })
        .orderBy('animal.fecha_registro', 'DESC')
        .getMany();

      if (animales.length === 0) {
        throw new NotFoundException(
          'No se encontraron animales en este momento.',
        );
      }

      return instanceToPlain(animales);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const animal = await this.animalRepo.findOne({ where: { id } });
      if (!animal)
        throw new NotFoundException('No se encontro el animal seleccionado');
      return animal;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateAnimalFincaDto: UpdateAnimalFincaDto,
    cliente: Cliente,
  ) {
    const {
      color,
      especie,
      fincaId,
      identificador,
      propietarioId,
      razaIds,
      sexo,
      animal_muerte,
      produccion,
      razon_muerte,
      tipo_produccion,
      edad_promedio,
      fecha_nacimiento,
      observaciones,
      tipo_alimentacion,
      castrado,
      esterelizado,
      medicamento,
      complementos,
      pureza,
      tipo_reproduccion,
      compra_animal,
      nombre_criador_origen_animal,
      nombre_padre,
      arete_padre,
      razas_padre,
      pureza_padre,
      nombre_criador_padre,
      nombre_propietario_padre,
      nombre_finca_origen_padre,
      nombre_madre,
      arete_madre,
      razas_madre,
      pureza_madre,
      nombre_criador_madre,
      nombre_propietario_madre,
      nombre_finca_origen_madre,
      nombre_animal,
      numero_parto_madre,
      padreId,
      madreId,
      asegurado,
      condicion_corporal,
      desparasitado,
      historial_reproductivo,
      veterinario,
      nivel_entrenamiento,
      peso_actual,
      resultados_competencias,
      uso_equino,
      vacunas,
      valor_estimado,
      registro_genealogico,
      microchip,
      unidad_alzada,
      odontologia,
      alergias,
      alzada,
      lesiones,
      precio_compra,
    } = updateAnimalFincaDto;

    try {
      if (!cliente) {
        throw new BadRequestException('Usuario no autenticado');
      }

      const animal = await this.animalRepo.findOne({
        where: { id },
        relations: [
          'especie',
          'razas',
          'finca',
          'propietario',
          'finca.asignaciones',
          'padre',
          'madre',
          'padre.razas',
          'madre.razas',
          'padre.propietario',
          'madre.propietario',
          'padre.finca',
          'madre.finca',
        ],
      });

      if (!animal) {
        throw new NotFoundException(`Animal con ID ${id} no encontrado`);
      }

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        if (animal.propietario.id !== cliente.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este animal',
          );
        }
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        const tieneAcceso = await this.fincaRepo
          .createQueryBuilder('finca')
          .innerJoin('finca.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .where('finca.id = :fincaId', { fincaId: animal.finca.id })
          .andWhere('trabajador.id = :trabajadorId', {
            trabajadorId: cliente.id,
          })
          .getOne();

        if (!tieneAcceso) {
          throw new UnauthorizedException(
            'No tienes permiso para editar animales en esta finca',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
      }

      if (padreId !== undefined) {
        if (padreId === null) {
          animal.padre = null;
          animal.nombre_padre = null;
          animal.arete_padre = null;
          animal.razas_padre = null;
          animal.pureza_padre = null;
          animal.nombre_propietario_padre = null;
          animal.nombre_finca_origen_padre = null;
          animal.nombre_criador_padre = null;
        } else {
          const padreAnimal = await this.animalRepo.findOne({
            where: { id: padreId },
            relations: ['razas', 'propietario', 'finca'],
          });

          if (!padreAnimal) {
            throw new BadRequestException(
              'No se encontró el padre seleccionado',
            );
          }

          if (padreAnimal.sexo !== 'Macho') {
            throw new BadRequestException(
              'El animal seleccionado como padre debe ser macho',
            );
          }

          if (padreAnimal.id === animal.id) {
            throw new BadRequestException(
              'Un animal no puede ser su propio padre',
            );
          }

          animal.padre = padreAnimal;

          animal.nombre_padre = padreAnimal.nombre_animal ?? 'N/D';
          animal.arete_padre = padreAnimal.identificador;
          animal.razas_padre = padreAnimal.razas;
          animal.pureza_padre = padreAnimal.pureza;
          animal.nombre_propietario_padre =
            padreAnimal.propietario?.nombre || null;
          animal.nombre_finca_origen_padre =
            padreAnimal.finca?.nombre_finca || null;
          animal.nombre_criador_padre =
            padreAnimal.nombre_criador_padre || null;
        }
      }

      if (madreId !== undefined) {
        if (madreId === null) {
          animal.madre = null;
          animal.nombre_madre = null;
          animal.arete_madre = null;
          animal.razas_madre = null;
          animal.pureza_madre = null;
          animal.nombre_propietario_madre = null;
          animal.nombre_finca_origen_madre = null;
          animal.nombre_criador_madre = null;
          animal.numero_parto_madre = null;
        } else {
          const madreAnimal = await this.animalRepo.findOne({
            where: { id: madreId },
            relations: ['razas', 'propietario', 'finca'],
          });

          if (!madreAnimal) {
            throw new BadRequestException(
              'No se encontró la madre seleccionada',
            );
          }

          if (madreAnimal.sexo !== 'Hembra') {
            throw new BadRequestException(
              'El animal seleccionado como madre debe ser hembra',
            );
          }

          if (madreAnimal.id === animal.id) {
            throw new BadRequestException(
              'Un animal no puede ser su propia madre',
            );
          }

          animal.madre = madreAnimal;

          animal.nombre_madre = madreAnimal.nombre_animal ?? 'N/D';
          animal.arete_madre = madreAnimal.identificador;
          animal.razas_madre = madreAnimal.razas;
          animal.pureza_madre = madreAnimal.pureza;
          animal.nombre_propietario_madre =
            madreAnimal.propietario?.nombre || null;
          animal.nombre_finca_origen_madre =
            madreAnimal.finca?.nombre_finca || null;
          animal.nombre_criador_madre =
            madreAnimal.nombre_criador_madre || null;

          if (numero_parto_madre !== undefined) {
            animal.numero_parto_madre = numero_parto_madre;
          }
        }
      }

      if (identificador && identificador !== animal.identificador) {
        const existeIdentificador = await this.animalRepo.findOne({
          where: { identificador },
        });
        if (existeIdentificador) {
          throw new ConflictException('El identificador ya está en uso');
        }
        animal.identificador = identificador;
      }

      if (especie) {
        const especie_animal = await this.especieAnimal.findOneBy({
          id: especie,
        });
        if (!especie_animal) {
          throw new NotFoundException(
            `Especie con ID ${especie} no encontrada`,
          );
        }
        animal.especie = especie_animal;
      }

      if (razaIds !== undefined) {
        if (
          !Array.isArray(razaIds) ||
          razaIds.length === 0 ||
          razaIds.length > 2
        ) {
          throw new BadRequestException('Debe ingresar entre 1 y 2 razas');
        }

        const razas = await this.razaAnimal.findBy({ id: In(razaIds) });
        if (razas.length !== razaIds.length) {
          throw new NotFoundException('Una o más razas no fueron encontradas');
        }
        animal.razas = razas;
      }

      if (padreId === undefined) {
        if (razas_padre !== undefined) {
          if (
            !Array.isArray(razas_padre) ||
            razas_padre.length === 0 ||
            razas_padre.length > 2
          ) {
            throw new BadRequestException(
              'Debe ingresar entre 1 y 2 razas para el padre',
            );
          }

          const razasPadreEntities = await this.razaAnimal.findBy({
            id: In(razas_padre),
          });
          if (razasPadreEntities.length !== razas_padre.length) {
            throw new NotFoundException(
              'Una o más razas del padre no fueron encontradas',
            );
          }
          animal.razas_padre = razasPadreEntities;
        }

        if (nombre_padre !== undefined) animal.nombre_padre = nombre_padre;
        if (arete_padre !== undefined) animal.arete_padre = arete_padre;
        if (nombre_criador_padre !== undefined)
          animal.nombre_criador_padre = nombre_criador_padre;
        if (nombre_propietario_padre !== undefined)
          animal.nombre_propietario_padre = nombre_propietario_padre;
        if (nombre_finca_origen_padre !== undefined)
          animal.nombre_finca_origen_padre = nombre_finca_origen_padre;
        if (pureza_padre !== undefined) animal.pureza_padre = pureza_padre;
      }

      if (madreId === undefined) {
        if (razas_madre !== undefined) {
          if (
            !Array.isArray(razas_madre) ||
            razas_madre.length === 0 ||
            razas_madre.length > 2
          ) {
            throw new BadRequestException(
              'Debe ingresar entre 1 y 2 razas para la madre',
            );
          }

          const razasMadreEntities = await this.razaAnimal.findBy({
            id: In(razas_madre),
          });
          if (razasMadreEntities.length !== razas_madre.length) {
            throw new NotFoundException(
              'Una o más razas de la madre no fueron encontradas',
            );
          }
          animal.razas_madre = razasMadreEntities;
        }

        if (nombre_madre !== undefined) animal.nombre_madre = nombre_madre;
        if (arete_madre !== undefined) animal.arete_madre = arete_madre;
        if (nombre_criador_madre !== undefined)
          animal.nombre_criador_madre = nombre_criador_madre;
        if (nombre_propietario_madre !== undefined)
          animal.nombre_propietario_madre = nombre_propietario_madre;
        if (nombre_finca_origen_madre !== undefined)
          animal.nombre_finca_origen_madre = nombre_finca_origen_madre;
        if (numero_parto_madre !== undefined)
          animal.numero_parto_madre = numero_parto_madre;
        if (pureza_madre !== undefined) animal.pureza_madre = pureza_madre;
      }

      if (fincaId && fincaId !== animal.finca.id) {
        const finca = await this.fincaRepo.findOne({
          where: { id: fincaId },
          relations: ['propietario'],
        });
        if (!finca) {
          throw new NotFoundException(`Finca con ID ${fincaId} no encontrada`);
        }

        if (finca.propietario.id !== animal.propietario.id) {
          throw new UnauthorizedException(
            'La finca no pertenece al propietario del animal',
          );
        }

        animal.finca = finca;
      }

      if (propietarioId && cliente.rol === TipoCliente.PROPIETARIO) {
        const propietario = await this.clienteRepo.findOneBy({
          id: propietarioId,
        });
        if (!propietario) {
          throw new NotFoundException(
            `Propietario con ID ${propietarioId} no encontrado`,
          );
        }
        animal.propietario = propietario;
      }

      if (tipo_alimentacion !== undefined) {
        if (
          !Array.isArray(tipo_alimentacion) ||
          tipo_alimentacion.length === 0
        ) {
          throw new BadRequestException(
            'Debe ingresar al menos un tipo de alimento',
          );
        }

        for (const alimentacion of tipo_alimentacion) {
          if (alimentacion.origen === 'comprado y producido') {
            const porcentaje_comprado = alimentacion.porcentaje_comprado ?? 0;
            const porcentaje_producido = alimentacion.porcentaje_producido ?? 0;
            const total = porcentaje_comprado + porcentaje_producido;

            if (total !== 100) {
              throw new BadRequestException(
                `El alimento "${alimentacion.alimento}" tiene porcentajes que no suman 100%. Comprado: ${porcentaje_comprado}%, Producido: ${porcentaje_producido}%`,
              );
            }
          }
        }

        for (const alimentacion of tipo_alimentacion) {
          if (alimentacion.origen !== 'comprado y producido') {
            delete alimentacion.porcentaje_comprado;
            delete alimentacion.porcentaje_producido;
          }
        }

        animal.tipo_alimentacion = tipo_alimentacion;
      }

      if (fecha_nacimiento !== undefined) {
        animal.fecha_nacimiento = new Date(fecha_nacimiento);
      }
      if (color !== undefined) animal.color = color;
      if (sexo !== undefined) animal.sexo = sexo;
      if (edad_promedio !== undefined) animal.edad_promedio = edad_promedio;
      if (observaciones !== undefined) animal.observaciones = observaciones;
      if (medicamento !== undefined) animal.medicamento = medicamento;
      if (complementos !== undefined) animal.complementos = complementos;
      if (castrado !== undefined) animal.castrado = castrado;
      if (esterelizado !== undefined) animal.esterelizado = esterelizado;
      if (pureza !== undefined) animal.pureza = pureza;
      if (tipo_reproduccion !== undefined)
        animal.tipo_reproduccion = tipo_reproduccion;
      if (tipo_produccion !== undefined)
        animal.tipo_produccion = tipo_produccion;
      if (produccion !== undefined) animal.produccion = produccion;
      if (animal_muerte !== undefined) animal.animal_muerte = animal_muerte;
      if (razon_muerte !== undefined) animal.razon_muerte = razon_muerte;
      if (compra_animal !== undefined) animal.compra_animal = compra_animal;
      if (nombre_criador_origen_animal !== undefined)
        animal.nombre_criador_origen_animal = nombre_criador_origen_animal;
      if (nombre_animal !== undefined) animal.nombre_animal = nombre_animal;

      //EQUINO
      if (asegurado !== undefined) animal.asegurado = asegurado;
      if (condicion_corporal !== undefined)
        animal.condicion_corporal = condicion_corporal;
      if (veterinario !== undefined) animal.veterinario = veterinario;
      if (historial_reproductivo !== undefined)
        animal.historial_reproductivo = historial_reproductivo;
      if (desparasitado !== undefined) animal.desparasitado = desparasitado;
      if (nivel_entrenamiento !== undefined)
        animal.nivel_entrenamiento = nivel_entrenamiento;
      if (peso_actual !== undefined) animal.peso_actual = peso_actual;
      if (resultados_competencias !== undefined)
        animal.resultados_competencias = resultados_competencias;
      if (uso_equino !== undefined) animal.uso_equino = uso_equino;
      if (vacunas !== undefined) animal.vacunas = vacunas;
      if (valor_estimado !== undefined) animal.valor_estimado = valor_estimado;
      if (registro_genealogico !== undefined)
        animal.registro_genealogico = registro_genealogico;
      if (alzada !== undefined) animal.alzada = alzada;
      if (microchip !== undefined) animal.microchip = microchip;
      if (unidad_alzada !== undefined) animal.unidad_alzada = unidad_alzada;
      if (odontologia !== undefined) animal.odontologia = odontologia;
      if (alergias !== undefined) animal.alergias = alergias;
      if (lesiones !== undefined) animal.lesiones = lesiones;
      if (precio_compra !== undefined) animal.precio_compra = precio_compra;
      await this.animalRepo.save({ ...animal, actualizado_por: cliente });

      return {
        message: 'Animal actualizado correctamente',
        animal: instanceToPlain(animal),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateAvicola(
    id: string,
    updateAvicolaDto: UpdateAvicolaFincaDto,
    cliente: Cliente,
  ) {
    const {
      especie,
      fincaId,
      identificador,
      razaIds,
      tipo_produccion,
      tipo_alimentacion,
      cantidad_lote,
      tipo_ave,
      proveedor_aves,
      galpon,
      mortalidad_diaria,
      consumo_alimento,
      consumo_agua,
      peso_promedio,
      huevos_diarios,
      huevos_rotos,
      calificacion_huevos,
      vacunas_lote,
      tratamientos,
      porcentaje_postura,
      tipo_concentrado,
      fecha_postura,
    } = updateAvicolaDto;

    try {
      const avicolaExistente = await this.animalRepo.findOne({
        where: { id },
        relations: ['propietario', 'trabajador', 'finca', 'especie', 'razas'],
      });

      if (!avicolaExistente) {
        throw new NotFoundException('Lote avícola no encontrado');
      }

      if (!avicolaExistente.cantidad_lote) {
        throw new BadRequestException('Este animal no es un lote de aves');
      }

      let propietario: Cliente;
      let trabajador: Cliente | null = null;

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        propietario = cliente;

        if (avicolaExistente.propietario.id !== cliente.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este lote avícola',
          );
        }
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        if (!cliente.propietario) {
          throw new BadRequestException(
            'El trabajador no tiene un propietario asignado',
          );
        }
        propietario = cliente.propietario;
        trabajador = cliente;

        const fincaAsignada = await this.fincaRepo
          .createQueryBuilder('finca')
          .innerJoin('finca.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .where('finca.id = :fincaId', { fincaId })
          .andWhere('trabajador.id = :trabajadorId', {
            trabajadorId: cliente.id,
          })
          .getOne();

        if (!fincaAsignada) {
          throw new UnauthorizedException(
            'No tienes permiso para editar lotes en esta finca',
          );
        }

        if (avicolaExistente.propietario.id !== propietario.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este lote avícola',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
      }

      const finca = await this.fincaRepo.findOne({
        where: { id: fincaId },
        relations: ['propietario', 'animales'],
      });

      if (!finca) {
        throw new NotFoundException('Finca no encontrada');
      }

      if (finca.propietario.id !== propietario.id) {
        throw new UnauthorizedException(
          'La finca no pertenece al propietario especificado',
        );
      }

      const especieAnimal = await this.especieAnimal.findOne({
        where: { id: especie },
      });
      if (!especieAnimal) {
        throw new NotFoundException('Especie no encontrada');
      }

      if (!finca.especies_maneja) {
        finca.especies_maneja = [];
      }

      const configEspecie = finca.especies_maneja.find(
        (e) => e.especie === especieAnimal.nombre,
      );

      if (configEspecie) {
        const avesExistentes =
          finca.animales
            ?.filter(
              (animal) =>
                animal.id !== avicolaExistente.id &&
                animal.especie.id === especie &&
                !animal.animal_muerte &&
                !animal.animal_vendido &&
                animal.lote_activo,
            )
            ?.reduce(
              (total, animal) => total + (animal.cantidad_lote || 0),
              0,
            ) || 0;

        const totalDespuesEdicion = avesExistentes + (cantidad_lote || 0);
        const cantidadAnterior = avicolaExistente.cantidad_lote || 0;
        const cantidadNueva = cantidad_lote || 0;

        if (cantidadNueva < cantidadAnterior) {
          const diferencia = cantidadAnterior - cantidadNueva;
          const nuevo_total = cantidadAnterior - diferencia;
          finca.especies_maneja = finca.especies_maneja.map((e) =>
            e.especie === especieAnimal.nombre
              ? {
                  ...e,
                  cantidad: nuevo_total,
                }
              : e,
          );

          await this.fincaRepo.save(finca);
        }
        if (totalDespuesEdicion > configEspecie.cantidad) {
          finca.especies_maneja = finca.especies_maneja.map((e) =>
            e.especie === especieAnimal.nombre
              ? {
                  ...e,
                  cantidad: totalDespuesEdicion,
                }
              : e,
          );

          await this.fincaRepo.save(finca);
        }
      } else {
        finca.especies_maneja.push({
          especie: especieAnimal.nombre,
          cantidad: cantidad_lote || 0,
        });

        await this.fincaRepo.save(finca);
      }

      const razas = await this.razaAnimal.findBy({ id: In(razaIds) });
      if (razas.length !== razaIds.length) {
        throw new NotFoundException('Una o más razas no fueron encontradas.');
      }

      if (!razaIds || razaIds.length === 0 || razaIds.length > 2) {
        throw new BadRequestException(
          'Debes ingresar al menos una raza y como máximo dos.',
        );
      }

      if (identificador !== avicolaExistente.identificador) {
        const existeIdentificador = await this.animalRepo.findOne({
          where: { identificador },
        });
        if (existeIdentificador) {
          throw new ConflictException(
            'El identificador del galpón ya está en uso por otro animal',
          );
        }
      }

      if (tipo_alimentacion) {
        for (const alimentacion of tipo_alimentacion) {
          if (alimentacion.origen === 'comprado y producido') {
            const porcentaje_comprado = alimentacion.porcentaje_comprado ?? 0;
            const porcentaje_producido = alimentacion.porcentaje_producido ?? 0;
            const total = porcentaje_comprado + porcentaje_producido;

            if (total !== 100) {
              throw new BadRequestException(
                `El alimento "${alimentacion.alimento}" tiene porcentajes que no suman 100%. ` +
                  `Comprado: ${porcentaje_comprado}%, Producido: ${porcentaje_producido}%`,
              );
            }
          }
        }
      }

      const avicolaActualizado = {
        ...avicolaExistente,
        especie: especieAnimal,
        identificador,
        razas,
        tipo_produccion,
        tipo_alimentacion,
        cantidad_lote,
        tipo_ave,
        proveedor_aves,
        galpon,
        mortalidad_diaria,
        consumo_alimento,
        consumo_agua,
        peso_promedio,
        huevos_diarios,
        huevos_rotos,
        calificacion_huevos,
        vacunas_lote,
        tratamientos,
        porcentaje_postura,
        tipo_concentrado,
        fecha_postura,
        finca,
        trabajador: trabajador || avicolaExistente.trabajador,
        actualizado_por: cliente,
        actualizadoPorId: cliente.id,
      };

      await this.animalRepo.save(avicolaActualizado);

      return {
        message: 'Lote avícola actualizado exitosamente',
        avicola: {
          id: avicolaActualizado.id,
          identificador: avicolaActualizado.identificador,
          propietario: propietario.nombre,
          trabajador: trabajador?.nombre || null,
          finca: finca.nombre_finca,
          cantidad_lote: avicolaActualizado.cantidad_lote,
          tipo_ave: avicolaActualizado.tipo_ave,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePeces(
    id: string,
    updatePecesDto: UpdatePecesFincaDto,
    cliente: Cliente,
  ) {
    const {
      especie,
      fincaId,
      identificador,
      razaIds,
      estanque_tanque_jaula,
      proveedor_alevines,
      fecha_siembra,
      cantidad_inicial,
      talla_peso_inicial,
      densidad_por_m3_m2,
      cantidad_actual,
      mortalidad_diaria_acum,
      muestreos,
      etapa,
      peso_promedio,
      biomasa_estimada,
      talla,
      fecha_muestreo,
      calidad_agua,
      tipo_concentrado,
      proteina_porcentaje,
      racion_diaria,
      consumo,
      conversion_alimenticia,
      sanidad,
      cosecha,
      lote_activo,
    } = updatePecesDto;

    try {
      const pezExistente = await this.animalRepo.findOne({
        where: { id },
        relations: ['propietario', 'trabajador', 'finca', 'especie', 'razas'],
      });

      if (!pezExistente) {
        throw new NotFoundException('Lote de peces no encontrado');
      }

      if (
        !pezExistente.cantidad_inicial &&
        pezExistente.cantidad_inicial !== 0
      ) {
        throw new BadRequestException('Este animal no es un lote de peces');
      }

      let propietario: Cliente;
      let trabajador: Cliente | null = null;

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        propietario = cliente;

        if (pezExistente.propietario.id !== cliente.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este lote de peces',
          );
        }
      } else if (
        cliente.rol === TipoCliente.TRABAJADOR ||
        cliente.rol === TipoCliente.SUPERVISOR
      ) {
        if (!cliente.propietario) {
          throw new BadRequestException(
            'El trabajador no tiene un propietario asignado',
          );
        }
        propietario = cliente.propietario;
        trabajador = cliente;

        const fincaAsignada = await this.fincaRepo
          .createQueryBuilder('finca')
          .innerJoin('finca.asignaciones', 'asignaciones')
          .innerJoin('asignaciones.trabajador', 'trabajador')
          .where('finca.id = :fincaId', { fincaId })
          .andWhere('trabajador.id = :trabajadorId', {
            trabajadorId: cliente.id,
          })
          .getOne();

        if (!fincaAsignada) {
          throw new UnauthorizedException(
            'No tienes permiso para editar lotes en esta finca',
          );
        }

        if (pezExistente.propietario.id !== propietario.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este lote de peces',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
      }

      const finca = await this.fincaRepo.findOne({
        where: { id: fincaId },
        relations: ['propietario', 'animales'],
      });

      if (!finca) {
        throw new NotFoundException('Finca no encontrada');
      }

      if (finca.propietario.id !== propietario.id) {
        throw new UnauthorizedException(
          'La finca no pertenece al propietario especificado',
        );
      }

      const especieAnimal = await this.especieAnimal.findOne({
        where: { id: especie },
      });
      if (!especieAnimal) {
        throw new NotFoundException('Especie no encontrada');
      }

      if (!finca.especies_maneja) {
        finca.especies_maneja = [];
      }

      const configEspecie = finca.especies_maneja.find(
        (e) => e.especie === especieAnimal.nombre,
      );

      if (configEspecie) {
        const avesExistentes =
          finca.animales
            ?.filter(
              (animal) =>
                animal.id !== pezExistente.id &&
                animal.especie.id === especie &&
                !animal.animal_muerte &&
                !animal.animal_vendido &&
                animal.lote_activo,
            )
            ?.reduce(
              (total, animal) => total + (animal.cantidad_inicial || 0),
              0,
            ) || 0;

        const totalDespuesEdicion = avesExistentes + (cantidad_inicial || 0);
        const cantidadAnterior = pezExistente.cantidad_lote || 0;
        const cantidadNueva = cantidad_inicial || 0;

        if (cantidadNueva < cantidadAnterior) {
          const diferencia = cantidadAnterior - cantidadNueva;
          const nuevo_total = cantidadAnterior - diferencia;
          finca.especies_maneja = finca.especies_maneja.map((e) =>
            e.especie === especieAnimal.nombre
              ? {
                  ...e,
                  cantidad: nuevo_total,
                }
              : e,
          );

          await this.fincaRepo.save(finca);
        }
        if (totalDespuesEdicion > configEspecie.cantidad) {
          finca.especies_maneja = finca.especies_maneja.map((e) =>
            e.especie === especieAnimal.nombre
              ? {
                  ...e,
                  cantidad: totalDespuesEdicion,
                }
              : e,
          );

          await this.fincaRepo.save(finca);
        }
      } else {
        finca.especies_maneja.push({
          especie: especieAnimal.nombre,
          cantidad: cantidad_inicial || 0,
        });

        await this.fincaRepo.save(finca);
      }

      const razas = await this.razaAnimal.findBy({ id: In(razaIds) });
      if (razas.length !== razaIds.length) {
        throw new NotFoundException('Una o más razas no fueron encontradas.');
      }

      if (!razaIds || razaIds.length === 0 || razaIds.length > 2) {
        throw new BadRequestException(
          'Debes ingresar al menos una raza y como máximo dos.',
        );
      }

      if (identificador !== pezExistente.identificador) {
        const existeIdentificador = await this.animalRepo.findOne({
          where: { identificador },
        });
        if (existeIdentificador) {
          throw new ConflictException(
            'El identificador del lote ya está en uso por otro animal',
          );
        }
      }

      if (fecha_siembra) {
        const fechaSiembra = new Date(fecha_siembra);
        const ahora = new Date();
        if (fechaSiembra > ahora) {
          throw new BadRequestException(
            'La fecha de siembra no puede ser futura',
          );
        }
      }

      if (calidad_agua) {
        if (calidad_agua.temperatura !== undefined) {
          if (calidad_agua.temperatura < 0 || calidad_agua.temperatura > 40) {
            throw new BadRequestException(
              'La temperatura debe estar entre 0°C y 40°C',
            );
          }
        }
        if (calidad_agua.ph !== undefined) {
          if (calidad_agua.ph < 0 || calidad_agua.ph > 14) {
            throw new BadRequestException('El pH debe estar entre 0 y 14');
          }
        }
      }

      const pezActualizado = {
        ...pezExistente,
        especie: especieAnimal,
        identificador,
        razas,
        finca,
        trabajador: trabajador || pezExistente.trabajador,
        lote_activo:
          lote_activo !== undefined ? lote_activo : pezExistente.lote_activo,
        estanque_tanque_jaula,
        proveedor_alevines,
        fecha_siembra: fecha_siembra
          ? new Date(fecha_siembra)
          : pezExistente.fecha_siembra,
        cantidad_inicial,
        talla_peso_inicial,
        densidad_por_m3_m2,
        cantidad_actual,
        mortalidad_diaria_acum,
        muestreos: muestreos || pezExistente.muestreos || [],
        etapa,
        peso_promedio_pez: peso_promedio,
        biomasa_estimada,
        talla_pez: talla,
        fecha_muestreo_pez: fecha_muestreo
          ? new Date(fecha_muestreo)
          : pezExistente.fecha_muestreo_pez,
        calidad_agua: calidad_agua || pezExistente.calidad_agua || {},
        tipo_concentrado_pez: tipo_concentrado,
        proteina_porcentaje,
        racion_diaria,
        consumo_pez: consumo,
        conversion_alimenticia,
        sanidad: sanidad || pezExistente.sanidad || {},
        cosecha: cosecha || pezExistente.cosecha || {},
        actualizado_por: cliente,
        actualizadoPorId: cliente.id,
      };

      await this.animalRepo.save(pezActualizado);

      return {
        message: 'Lote de peces actualizado exitosamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async updateDeathStatus(
    id: string,
    updateData: UpdateDeathStatusDto,
  ): Promise<AnimalFinca> {
    const { animal_muerte, razon_muerte } = updateData;

    const animal = await this.animalRepo.findOne({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado`);
    }

    if (animal_muerte && !razon_muerte) {
      throw new BadRequestException(
        'Debe proporcionar una razón de muerte cuando el animal ha fallecido',
      );
    }

    animal.animal_muerte = animal_muerte;
    animal.razon_muerte = animal_muerte ? razon_muerte : 'N/D';

    return await this.animalRepo.save(animal);
  }

  remove(id: number) {
    return `This action removes a #${id} animalFinca`;
  }
}
