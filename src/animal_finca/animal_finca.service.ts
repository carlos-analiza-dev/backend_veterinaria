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
  UpdateCaprinoFincaDto,
  UpdateOvinoFincaDto,
  UpdatePecesFincaDto,
  UpdatePorcinoFincaDto,
} from './dto/update-animal_finca.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalFinca } from './entities/animal_finca.entity';
import { DataSource, In, Repository } from 'typeorm';
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
import { CreatePecesDto, EtapaPez } from './dto/create-peces.dto';
import { isUUID } from 'class-validator';
import { CreateCaprinoDto } from './dto/crear-caprino.dto';
import { CreateOvinoDto } from './dto/create-ovino.dto';
import { CreatePorcinoDto } from './dto/crear-porcino.dto';
import { EtapaAvicola } from 'src/interfaces/avicola/avicola.enums';
import {
  PurezaEnum,
  TipoReproduccionEnum,
} from 'src/interfaces/animales/animales-enums';
import { EstadoCria, SexoCria } from 'src/interfaces/partos.enums';
import { CreateAnimalFromCriaDto } from './dto/create-animal-from-cria.dto';
import { PartoAnimal } from 'src/parto_animal/entities/parto_animal.entity';
import { DescarteAnimalDto } from './dto/descarte-animal.dto';
import { DescartesAnimal } from 'src/descartes_animal/entities/descartes_animal.entity';
import { CreateMortalidadAnimalDto } from './dto/mortalidad-animal';
import { MortalidadAnimal } from 'src/mortalidad_animal/entities/mortalidad_animal.entity';
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
    @InjectRepository(PartoAnimal)
    private readonly partoRepository: Repository<PartoAnimal>,
    private readonly notificacionesService: NotificacionesAdminsService,
    private serviceImagesAnimal: ImagesAminalesService,
    @InjectRepository(DescartesAnimal)
    private descarteRepo: Repository<DescartesAnimal>,
    @InjectRepository(MortalidadAnimal)
    private mortalidadRepo: Repository<MortalidadAnimal>,
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
            console.warn(
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
      etapa_avicola,
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
        etapa_avicola,
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
            console.warn(
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
            console.warn(
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

  async createCaprino(
    createCaprinoDto: CreateCaprinoDto,
    cliente: Cliente,
    images: Express.Multer.File[],
  ) {
    const {
      identificador,
      nombre_animal,
      fincaId,
      padreId,
      madreId,
      potrero,
      razaIds,
      sexo,
      edad_promedio,
      fecha_nacimiento,
      color,
      peso,
      condicion_corporal,
      proposito,
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
      numero_parto_madre,
      nombre_criador_origen_animal,
      linea_genetica,
      litros_leche_dia,
      peso_destete,
      ganancia_peso,
      calidad_leche_grasa,
      calidad_leche_proteina,
      calidad_leche_celulas,
      desparasitado,
      vacunas,
      mastitis,
      pezunas,
      tratamientos,
      mortalidad,
      tipo_alimentacion,
      observaciones,
      propietarioId,
      especie,
    } = createCaprinoDto;

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
        identificador,
        nombre_animal,
        finca,
        propietario,
        trabajador,
        creado_por: cliente,
        especie: especie_animal,
        razas,
        sexo,
        edad_promedio,
        fecha_nacimiento,
        color,
        peso,
        condicion_corporal,
        proposito,
        potrero,
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
        nombre_criador_origen_animal,
        linea_genetica,
        litros_leche_dia,
        peso_destete,
        ganancia_peso,
        calidad_leche_grasa,
        calidad_leche_proteina,
        calidad_leche_celulas,
        desparasitado,
        vacunas,
        mastitis,
        pezunas,
        tratamientos,
        mortalidad,
        tipo_alimentacion,
        observaciones,
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
            console.warn(
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
        'Nuevo Caprino Registrado',
        `Se ha ingresado un nuevo caprino con el arete: ${nuevoAnimal.identificador}, en la finca ${nuevoAnimal.finca.nombre_finca}, por ${creadorNombre}`,
      );

      return {
        message: 'Caprino creado exitosamente',
        animal: {
          id: nuevoAnimal.id,
          identificador: nuevoAnimal.identificador,
          nombre_animal: nuevoAnimal.nombre_animal,
          propietario: propietario.nombre,
          trabajador: trabajador?.nombre || null,
          finca: finca.nombre_finca,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async createOvino(
    createOvinoDto: CreateOvinoDto,
    cliente: Cliente,
    images: Express.Multer.File[],
  ) {
    const {
      identificador,
      nombre_animal,
      fincaId,
      padreId,
      madreId,
      potrero,
      razaIds,
      sexo,
      edad_promedio,
      fecha_nacimiento,
      color,
      peso,
      condicion_corporal,
      proposito,
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
      numero_parto_madre,
      nombre_criador_origen_animal,
      categoria_edad,
      tipo_nacimiento,
      peso_nacimiento,
      peso_destete,
      lana,
      historial_esquila,
      famacha,
      parasitos,
      desparasitado,
      vacunas,
      pezunas,
      tratamientos,
      mortalidad,
      tipo_alimentacion,
      observaciones,
      propietarioId,
      especie,
      ganancia_peso,
    } = createOvinoDto;

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

      if (famacha !== undefined && (famacha < 1 || famacha > 5)) {
        throw new BadRequestException(
          'El valor de FAMACHA debe estar entre 1 y 5',
        );
      }

      let padreAnimal: AnimalFinca | null = null;
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

      let madreAnimal: AnimalFinca | null = null;
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
        identificador,
        nombre_animal,
        finca,
        propietario,
        trabajador,
        creado_por: cliente,
        especie: especie_animal,
        razas,
        sexo,
        edad_promedio,
        fecha_nacimiento: fecha_nacimiento
          ? new Date(fecha_nacimiento)
          : undefined,
        color,
        peso,
        condicion_corporal,
        proposito,
        observaciones,
        tipo_alimentacion,
        nombre_criador_origen_animal,
        potrero,
        pezunas,
        ganancia_peso,
        mortalidad,
        desparasitado,
        vacunas,
        tratamientos,
        categoria_edad,
        tipo_nacimiento,
        peso_nacimiento,
        peso_destete,
        lana,
        historial_esquila,
        famacha,
        parasitos,
        padre: padreAnimal,
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

        madre: madreAnimal,
        nombre_madre: madreAnimal?.nombre_animal ?? nombre_madre,
        arete_madre: madreAnimal?.identificador ?? arete_madre,
        razas_madre: madreAnimal?.razas ?? razasMadre,
        pureza_madre: madreAnimal?.pureza ?? pureza_madre,
        nombre_propietario_madre:
          madreAnimal?.propietario?.nombre ?? nombre_propietario_madre,
        nombre_finca_origen_madre:
          madreAnimal?.finca?.nombre_finca ?? nombre_finca_origen_madre,
        numero_parto_madre: numero_parto_madre ?? 1,
        nombre_criador_madre:
          madreAnimal?.nombre_criador_madre ?? nombre_criador_madre,
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
            console.warn(
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
        'Nuevo Ovino Registrado',
        `Se ha ingresado un nuevo ovino con el arete: ${nuevoAnimal.identificador}, en la finca ${nuevoAnimal.finca.nombre_finca}, por ${creadorNombre}`,
      );

      return {
        message: 'Ovino creado exitosamente',
        animal: {
          id: nuevoAnimal.id,
          identificador: nuevoAnimal.identificador,
          nombre_animal: nuevoAnimal.nombre_animal,
          propietario: propietario.nombre,
          trabajador: trabajador?.nombre || null,
          finca: finca.nombre_finca,
          categoria_edad: nuevoAnimal.categoria_edad,
          famacha: nuevoAnimal.famacha,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async createPorcino(
    createPorcinoDto: CreatePorcinoDto,
    cliente: Cliente,
    images: Express.Multer.File[],
  ) {
    const {
      identificador,
      nombre_animal,
      fincaId,
      razaIds,
      sexo,
      color,
      tipo_registro_porcino,
      etapa_porcino,
      corral_galera,
      lote,
      proveedor,
      fecha_ingreso_porcino,
      cantidad_inicial_porcino,
      cantidad_actual_porcino,
      peso_inicial_porcino,
      peso_promedio,
      ganancia_peso,
      fecha_pesaje_porcino,
      tipo_alimentacion,
      consumo_diario_porcino,
      vacunas,
      tratamientos,
      condicion_corporal,
      desparasitado,
      mortalidad,
      bajas_mortalidad_porcino,
      cuarentena_porcino,
      fecha_salida_porcino,
      peso_salida_porcino,
      comprador_porcino,
      precio_porcino,
      rendimiento_canal_porcino,
      propietarioId,
      nombre_criador_origen_animal,
      observaciones,
      especie,
    } = createPorcinoDto;

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

        const cantidadEntrante = cantidad_inicial_porcino || 1;

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
          cantidad: cantidad_inicial_porcino || 1,
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

      const nuevoAnimal = this.animalRepo.create({
        identificador,
        nombre_animal,
        finca,
        propietario,
        trabajador,
        creado_por: cliente,
        especie: especie_animal,
        razas,
        sexo,
        color,
        tipo_registro_porcino,
        etapa_porcino,
        corral_galera,
        lote,
        proveedor,
        fecha_ingreso_porcino: fecha_ingreso_porcino
          ? new Date(fecha_ingreso_porcino)
          : undefined,
        cantidad_inicial_porcino,
        cantidad_actual_porcino:
          cantidad_actual_porcino || cantidad_inicial_porcino || 1,
        peso_inicial_porcino,
        peso_promedio,
        ganancia_peso,
        fecha_pesaje_porcino: fecha_pesaje_porcino
          ? new Date(fecha_pesaje_porcino)
          : undefined,
        tipo_alimentacion,
        consumo_diario_porcino,
        vacunas,
        tratamientos,
        condicion_corporal,
        desparasitado: desparasitado || false,
        mortalidad: mortalidad || false,
        bajas_mortalidad_porcino: bajas_mortalidad_porcino || 0,
        cuarentena_porcino: cuarentena_porcino || false,
        fecha_salida_porcino: fecha_salida_porcino
          ? new Date(fecha_salida_porcino)
          : undefined,
        peso_salida_porcino,
        comprador_porcino,
        precio_porcino,
        rendimiento_canal_porcino,
        nombre_criador_origen_animal,
        observaciones,
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
            console.warn(
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
        'Nuevo Porcino Registrado',
        `Se ha ingresado un nuevo porcino con el identificador: ${nuevoAnimal.identificador}, en la finca ${nuevoAnimal.finca.nombre_finca}, por ${creadorNombre}`,
      );

      return {
        message: 'Porcino creado exitosamente',
        animal: {
          id: nuevoAnimal.id,
          identificador: nuevoAnimal.identificador,
          nombre_animal: nuevoAnimal.nombre_animal,
          propietario: propietario.nombre,
          trabajador: trabajador?.nombre || null,
          finca: finca.nombre_finca,
          etapa_porcino: nuevoAnimal.etapa_porcino,
          corral_galera: nuevoAnimal.corral_galera,
          cantidad_inicial: nuevoAnimal.cantidad_inicial_porcino,
          cantidad_actual: nuevoAnimal.cantidad_actual_porcino,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async createAnimalFromCria(
    createDto: CreateAnimalFromCriaDto,
    cliente: Cliente,
  ): Promise<AnimalFinca> {
    const parto = await this.partoRepository.findOne({
      where: { id: createDto.partoId },
      relations: [
        'hembra',
        'hembra.finca',
        'hembra.propietario',
        'hembra.razas',
        'hembra.razas_madre',
        'hembra.padre',
        'servicio_asociado',
        'servicio_asociado.macho',
      ],
    });

    if (!parto) {
      throw new NotFoundException('Parto no encontrado');
    }

    if (!parto.crias || createDto.criaIndex >= parto.crias.length) {
      throw new BadRequestException('Cría no encontrada en el parto');
    }

    const cria = parto.crias[createDto.criaIndex];

    if (cria.identificador && cria.identificador.includes('ANIMAL-')) {
      throw new BadRequestException(
        'Esta cría ya ha sido registrada como animal',
      );
    }

    const hembra = parto.hembra;
    const servicio = parto.servicio_asociado;

    const identificador = createDto.identificador || this.generateIdentifier();

    const nuevoAnimal = this.animalRepo.create({
      especie: hembra.especie,
      sexo: createDto.sexo === SexoCria.MACHO ? 'Macho' : 'Hembra',
      finca: { id: createDto.fincaId },
      fincaId: createDto.fincaId,
      identificador: identificador,
      fecha_nacimiento: createDto.fecha_nacimiento
        ? new Date(createDto.fecha_nacimiento)
        : cria.fecha_nacimiento || new Date(),
      propietario: hembra.propietario,
      propietarioId: hembra.propietarioId,
      madre: hembra,
      razas_madre: hembra.razas_madre || [],
      numero_parto_madre: parto.numero_parto || 1,
      nombre_finca_origen_madre: hembra.nombre_finca_origen_madre || 'N/D',
      madreId: hembra.id,
      padre: servicio?.macho || null,
      padreId: servicio?.macho?.id || null,
      creadoPorId: cliente.id,
      creado_por: cliente,
      tipo_reproduccion:
        hembra.tipo_reproduccion || TipoReproduccionEnum.NATURAL,
      pureza: hembra.pureza || PurezaEnum.NO_DEFINIDA,
      razas: hembra.razas || [],
      color: cria.observaciones?.includes('color') ? 'N/D' : 'N/D',
      observaciones: cria.observaciones || 'Animal nacido en finca',
      compra_animal: false,
      animal_vendido: false,
      animal_muerte: false,
      edad_promedio: 0,
      lote_activo: true,
      vacunas: 'Sin vacunas',
      vacunas_lote: 'Sin vacunas',
      nombre_madre: hembra.nombre_animal || hembra.identificador,
      arete_madre: hembra.identificador,
      pureza_madre: hembra.pureza || PurezaEnum.NO_DEFINIDA,
      nombre_criador_madre: hembra.nombre_criador_origen_animal || 'N/D',
      nombre_propietario_madre: hembra.propietario?.nombre || 'N/D',
      ...(servicio?.macho && {
        nombre_padre:
          servicio.macho.nombre_animal || servicio.macho.identificador,
        arete_padre: servicio.macho.identificador,
        pureza_padre: servicio.macho.pureza || PurezaEnum.NO_DEFINIDA,
        nombre_criador_padre:
          servicio.macho.nombre_criador_origen_animal || 'N/D',
        nombre_propietario_padre: servicio.macho.propietario?.nombre || 'N/D',
        nombre_finca_origen_padre:
          servicio.macho.nombre_finca_origen_padre || 'N/D',
        razas_padre: servicio.macho.razas || [],
      }),
    });

    const animalGuardado = await this.animalRepo.save(nuevoAnimal);

    parto.crias[createDto.criaIndex] = {
      ...cria,
      identificador: animalGuardado
        ? animalGuardado.identificador
        : `$ANIMAL-${animalGuardado.id}`,
      estado: EstadoCria.VIVA,
    };

    await this.partoRepository.save(parto);

    return animalGuardado;
  }

  private generateIdentifier(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CRIA-${timestamp}-${random}`;
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
      limit = 8,
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
        })
        .andWhere('animal.descartado = :descartado', {
          descartado: false,
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
        if (isUUID(especieId)) {
          query.andWhere('animal.especieId = :especieId', {
            especieId,
          });
        } else {
          query.andWhere('LOWER(especie.nombre) = LOWER(:especieNombre)', {
            especieNombre: especieId,
          });
        }
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
    const { sexo, especie } = paginationDto;
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
        })
        .andWhere('animal.descartado = :descartado', {
          descartado: false,
        });

      if (sexo) {
        query.andWhere('LOWER(animal.sexo) = LOWER(:sexo)', {
          sexo,
        });
      }

      if (especie) {
        const valor = especie.trim();

        if (isUUID(valor)) {
          query.andWhere('especie.id = :especieId', {
            especieId: valor,
          });
        } else {
          query.andWhere('LOWER(especie.nombre) = LOWER(:nombre)', {
            nombre: valor,
          });
        }
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
        .andWhere('animal.descartado = :descartado', {
          descartado: false,
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
      etapa_avicola,
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
        etapa_avicola: etapa_avicola ?? EtapaAvicola.AYUNO,
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
        etapa: etapa ?? EtapaPez.ALEVIN,
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

  async updateCaprino(
    id: string,
    updateCaprinoDto: UpdateCaprinoFincaDto,
    cliente: Cliente,
  ) {
    const {
      identificador,
      nombre_animal,
      fincaId,
      padreId,
      madreId,
      potrero,
      razaIds,
      sexo,
      edad_promedio,
      fecha_nacimiento,
      color,
      peso,
      condicion_corporal,
      proposito,
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
      numero_parto_madre,
      nombre_criador_origen_animal,
      linea_genetica,
      litros_leche_dia,
      peso_destete,
      ganancia_peso,
      calidad_leche_grasa,
      calidad_leche_proteina,
      calidad_leche_celulas,
      desparasitado,
      vacunas,
      mastitis,
      pezunas,
      tratamientos,
      mortalidad,
      tipo_alimentacion,
      observaciones,
      propietarioId,
      especie,
    } = updateCaprinoDto;

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
        throw new NotFoundException(`Caprino con ID ${id} no encontrado`);
      }

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        if (animal.propietario.id !== cliente.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este caprino',
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
            'No tienes permiso para editar caprinos en esta finca',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
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

      if (padreId !== undefined) {
        if (padreId === null) {
          animal.padre = null;
          animal.nombre_padre = null;
          animal.arete_padre = null;
          animal.razas_padre = [];
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
          animal.razas_madre = [];
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

      if (nombre_animal !== undefined) animal.nombre_animal = nombre_animal;
      if (sexo !== undefined) animal.sexo = sexo;
      if (edad_promedio !== undefined) animal.edad_promedio = edad_promedio;
      if (fecha_nacimiento !== undefined) {
        animal.fecha_nacimiento = new Date(fecha_nacimiento);
      }
      if (color !== undefined) animal.color = color;
      if (observaciones !== undefined) animal.observaciones = observaciones;
      if (nombre_criador_origen_animal !== undefined)
        animal.nombre_criador_origen_animal = nombre_criador_origen_animal;

      if (peso !== undefined) animal.peso = peso;
      if (condicion_corporal !== undefined)
        animal.condicion_corporal = condicion_corporal;
      if (proposito !== undefined) animal.proposito = proposito;
      if (potrero !== undefined) animal.potrero = potrero;
      if (linea_genetica !== undefined) animal.linea_genetica = linea_genetica;
      if (litros_leche_dia !== undefined)
        animal.litros_leche_dia = litros_leche_dia;
      if (peso_destete !== undefined) animal.peso_destete = peso_destete;
      if (ganancia_peso !== undefined) animal.ganancia_peso = ganancia_peso;
      if (calidad_leche_grasa !== undefined)
        animal.calidad_leche_grasa = calidad_leche_grasa;
      if (calidad_leche_proteina !== undefined)
        animal.calidad_leche_proteina = calidad_leche_proteina;
      if (calidad_leche_celulas !== undefined)
        animal.calidad_leche_celulas = calidad_leche_celulas;
      if (desparasitado !== undefined) animal.desparasitado = desparasitado;
      if (vacunas !== undefined) animal.vacunas = vacunas;
      if (mastitis !== undefined) animal.mastitis = mastitis;
      if (pezunas !== undefined) animal.pezunas = pezunas;
      if (tratamientos !== undefined) animal.tratamientos = tratamientos;
      if (mortalidad !== undefined) animal.mortalidad = mortalidad;

      await this.animalRepo.save({ ...animal, actualizado_por: cliente });

      return {
        message: 'Caprino actualizado correctamente',
        animal: instanceToPlain(animal),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateOvino(
    id: string,
    updateOvinoDto: UpdateOvinoFincaDto,
    cliente: Cliente,
  ) {
    const {
      identificador,
      nombre_animal,
      fincaId,
      padreId,
      madreId,
      potrero,
      razaIds,
      sexo,
      edad_promedio,
      fecha_nacimiento,
      color,
      peso,
      condicion_corporal,
      proposito,
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
      numero_parto_madre,
      nombre_criador_origen_animal,
      peso_nacimiento,
      peso_destete,
      ganancia_peso,
      desparasitado,
      vacunas,
      pezunas,
      tratamientos,
      mortalidad,
      tipo_alimentacion,
      observaciones,
      propietarioId,
      especie,
      lana,
      historial_esquila,
      famacha,
      parasitos,
      categoria_edad,
      tipo_nacimiento,
    } = updateOvinoDto;

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
        throw new NotFoundException(`Ovino con ID ${id} no encontrado`);
      }

      if (animal.especie?.nombre?.toLowerCase() !== 'ovino') {
        throw new BadRequestException('El animal no es un ovino');
      }

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        if (animal.propietario.id !== cliente.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este ovino',
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
            'No tienes permiso para editar ovinos en esta finca',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
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

      if (padreId !== undefined) {
        if (padreId === null) {
          animal.padre = null;
          animal.nombre_padre = null;
          animal.arete_padre = null;
          animal.razas_padre = [];
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
          animal.razas_madre = [];
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

      if (lana !== undefined) {
        if (lana === null) {
          animal.lana = null;
        } else {
          animal.lana = {
            fecha_esquila: lana.fecha_esquila
              ? new Date(lana.fecha_esquila)
              : undefined,
            calidad_micras: lana.calidad_micras,
            color_lana: lana.color_lana,
            peso_vellon: lana.peso_vellon,
          };
        }
      }

      if (historial_esquila !== undefined) {
        if (historial_esquila === null || historial_esquila.length === 0) {
          animal.historial_esquila = [];
        } else {
          animal.historial_esquila = historial_esquila.map((item) => ({
            fecha_esquila: new Date(item.fecha_esquila),
            peso_vellon_kg: item.peso_vellon_kg,
            calidad_clasificacion: item.calidad_clasificacion,
            esquilador_responsable: item.esquilador_responsable,
            observaciones: item.observaciones,
          }));
        }
      }

      if (parasitos !== undefined) {
        if (parasitos === null || parasitos.length === 0) {
          animal.parasitos = [];
        } else {
          animal.parasitos = parasitos.map((item) => ({
            famacha: item.famacha,
            tratamiento: item.tratamiento,
            fecha_tratamiento: item.fecha_tratamiento
              ? new Date(item.fecha_tratamiento)
              : undefined,
            observaciones: item.observaciones,
          }));
        }
      }

      if (nombre_animal !== undefined) animal.nombre_animal = nombre_animal;
      if (sexo !== undefined) animal.sexo = sexo;
      if (edad_promedio !== undefined) animal.edad_promedio = edad_promedio;
      if (fecha_nacimiento !== undefined) {
        animal.fecha_nacimiento = new Date(fecha_nacimiento);
      }
      if (color !== undefined) animal.color = color;
      if (observaciones !== undefined) animal.observaciones = observaciones;
      if (nombre_criador_origen_animal !== undefined)
        animal.nombre_criador_origen_animal = nombre_criador_origen_animal;
      if (peso !== undefined) animal.peso = peso;
      if (condicion_corporal !== undefined)
        animal.condicion_corporal = condicion_corporal;
      if (proposito !== undefined) animal.proposito = proposito;
      if (potrero !== undefined) animal.potrero = potrero;
      if (peso_nacimiento !== undefined)
        animal.peso_nacimiento = peso_nacimiento;
      if (peso_destete !== undefined) animal.peso_destete = peso_destete;
      if (ganancia_peso !== undefined) animal.ganancia_peso = ganancia_peso;
      if (desparasitado !== undefined) animal.desparasitado = desparasitado;
      if (vacunas !== undefined) animal.vacunas = vacunas;
      if (pezunas !== undefined) animal.pezunas = pezunas;
      if (tratamientos !== undefined) animal.tratamientos = tratamientos;
      if (mortalidad !== undefined) animal.mortalidad = mortalidad;

      // Campos específicos de ovinos
      if (famacha !== undefined) animal.famacha = famacha;
      if (categoria_edad !== undefined) animal.categoria_edad = categoria_edad;
      if (tipo_nacimiento !== undefined)
        animal.tipo_nacimiento = tipo_nacimiento;

      // Guardar cambios
      await this.animalRepo.save({ ...animal, actualizado_por: cliente });

      return {
        message: 'Ovino actualizado correctamente',
        animal: instanceToPlain(animal),
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePorcino(
    id: string,
    updatePorcinoDto: UpdatePorcinoFincaDto,
    cliente: Cliente,
  ) {
    const {
      identificador,
      nombre_animal,
      fincaId,
      sexo,
      color,
      razaIds,
      tipo_registro_porcino,
      etapa_porcino,
      corral_galera,
      lote,
      proveedor,
      fecha_ingreso_porcino,
      cantidad_inicial_porcino,
      cantidad_actual_porcino,
      peso_inicial_porcino,
      peso_promedio,
      ganancia_peso,
      fecha_pesaje_porcino,
      tipo_alimentacion,
      consumo_diario_porcino,
      vacunas,
      tratamientos,
      condicion_corporal,
      desparasitado,
      mortalidad,
      bajas_mortalidad_porcino,
      cuarentena_porcino,
      fecha_salida_porcino,
      peso_salida_porcino,
      comprador_porcino,
      precio_porcino,
      rendimiento_canal_porcino,
      propietarioId,
      nombre_criador_origen_animal,
      observaciones,
      especie,
    } = updatePorcinoDto;

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
        ],
      });

      if (!animal) {
        throw new NotFoundException(`Porcino con ID ${id} no encontrado`);
      }

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        if (animal.propietario.id !== cliente.id) {
          throw new UnauthorizedException(
            'No tienes permiso para editar este porcino',
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
            'No tienes permiso para editar porcinos en esta finca',
          );
        }
      } else {
        throw new BadRequestException('Rol de usuario no válido');
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

      if (especie) {
        const especieAnimal = await this.especieAnimal.findOneBy({
          id: especie,
        });

        if (!especieAnimal) {
          throw new NotFoundException(
            `Especie con ID ${especie} no encontrada`,
          );
        }

        animal.especie = especieAnimal;
      }

      if (razaIds !== undefined) {
        if (
          !Array.isArray(razaIds) ||
          razaIds.length === 0 ||
          razaIds.length > 2
        ) {
          throw new BadRequestException('Debe ingresar entre 1 y 2 razas');
        }

        const razas = await this.razaAnimal.findBy({
          id: In(razaIds),
        });

        if (razas.length !== razaIds.length) {
          throw new NotFoundException('Una o más razas no fueron encontradas');
        }

        animal.razas = razas;
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
            const comprado = alimentacion.porcentaje_comprado ?? 0;
            const producido = alimentacion.porcentaje_producido ?? 0;

            if (comprado + producido !== 100) {
              throw new BadRequestException(
                `El alimento "${alimentacion.alimento}" tiene porcentajes que no suman 100%.`,
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

      if (nombre_animal !== undefined) animal.nombre_animal = nombre_animal;

      if (sexo !== undefined) animal.sexo = sexo;

      if (color !== undefined) animal.color = color;

      if (observaciones !== undefined) animal.observaciones = observaciones;

      if (nombre_criador_origen_animal !== undefined)
        animal.nombre_criador_origen_animal = nombre_criador_origen_animal;

      if (tipo_registro_porcino !== undefined)
        animal.tipo_registro_porcino = tipo_registro_porcino;

      if (etapa_porcino !== undefined) animal.etapa_porcino = etapa_porcino;

      if (corral_galera !== undefined) animal.corral_galera = corral_galera;

      if (lote !== undefined) animal.lote = lote;

      if (proveedor !== undefined) animal.proveedor = proveedor;

      if (fecha_ingreso_porcino !== undefined)
        animal.fecha_ingreso_porcino = new Date(fecha_ingreso_porcino);

      if (cantidad_inicial_porcino !== undefined)
        animal.cantidad_inicial_porcino = cantidad_inicial_porcino;

      if (cantidad_actual_porcino !== undefined)
        animal.cantidad_actual_porcino = cantidad_actual_porcino;

      if (peso_inicial_porcino !== undefined)
        animal.peso_inicial_porcino = peso_inicial_porcino;

      if (peso_promedio !== undefined) animal.peso_promedio = peso_promedio;

      if (ganancia_peso !== undefined) animal.ganancia_peso = ganancia_peso;

      if (fecha_pesaje_porcino !== undefined)
        animal.fecha_pesaje_porcino = new Date(fecha_pesaje_porcino);

      if (consumo_diario_porcino !== undefined)
        animal.consumo_diario_porcino = consumo_diario_porcino;

      if (vacunas !== undefined) animal.vacunas = vacunas;

      if (tratamientos !== undefined) animal.tratamientos = tratamientos;

      if (condicion_corporal !== undefined)
        animal.condicion_corporal = condicion_corporal;

      if (desparasitado !== undefined) animal.desparasitado = desparasitado;

      if (mortalidad !== undefined) animal.mortalidad = mortalidad;

      if (bajas_mortalidad_porcino !== undefined)
        animal.bajas_mortalidad_porcino = bajas_mortalidad_porcino;

      if (cuarentena_porcino !== undefined)
        animal.cuarentena_porcino = cuarentena_porcino;

      if (fecha_salida_porcino !== undefined) {
        animal.fecha_salida_porcino = fecha_salida_porcino
          ? new Date(fecha_salida_porcino)
          : null;
      }

      if (peso_salida_porcino !== undefined)
        animal.peso_salida_porcino = peso_salida_porcino;

      if (comprador_porcino !== undefined)
        animal.comprador_porcino = comprador_porcino;

      if (precio_porcino !== undefined) animal.precio_porcino = precio_porcino;

      if (rendimiento_canal_porcino !== undefined)
        animal.rendimiento_canal_porcino = rendimiento_canal_porcino;

      await this.animalRepo.save({
        ...animal,
        actualizado_por: cliente,
      });

      return {
        message: 'Porcino actualizado correctamente',
        animal: instanceToPlain(animal),
      };
    } catch (error) {
      throw error;
    }
  }

  async descartarAnimal(
    id: string,
    descarteDto: DescarteAnimalDto,
    cliente: Cliente,
  ) {
    const animal = await this.findOne(id);

    if (!animal) {
      throw new NotFoundException('El animal que intentas descartar no existe');
    }

    animal.descartado = descarteDto.descartado ?? true;
    animal.razon_descarte = descarteDto.razon_descarte ?? 'N/D';
    animal.fecha_descarte = descarteDto.fecha_descarte;
    animal.descartadoPorId = cliente.id;

    await this.animalRepo.save(animal);

    return {
      message: 'Animal descartado correctamente',
    };
  }

  async descartarAves(
    id: string,
    descarteDto: DescarteAnimalDto,
    cliente: Cliente,
  ) {
    const animal = await this.findOne(id);

    if (!animal) {
      throw new NotFoundException(
        'El lote de aves que intentas descartar no existe',
      );
    }

    if (!animal.cantidad_lote && animal.cantidad_lote !== 0) {
      throw new BadRequestException(
        'Este animal no tiene una cantidad de lote definida',
      );
    }

    if (descarteDto.cantidad > animal.cantidad_lote) {
      throw new BadRequestException(
        `La cantidad a descartar (${descarteDto.cantidad}) excede la cantidad actual (${animal.cantidad_lote})`,
      );
    }

    const cantidadAnterior = animal.cantidad_lote;
    const cantidadNueva = cantidadAnterior - descarteDto.cantidad;

    animal.descartado = descarteDto.descartado ?? true;
    animal.razon_descarte = descarteDto.razon_descarte ?? 'N/D';
    animal.fecha_descarte = descarteDto.fecha_descarte;
    animal.descartadoPorId = cliente.id;
    animal.cantidad_lote = cantidadNueva;

    const animal_save = await this.animalRepo.save(animal);

    const descartes = this.descarteRepo.create({
      animalId: animal_save.id,
      razon_descarte: descarteDto.razon_descarte,
      cantidad: descarteDto.cantidad,
      fecha_descarte: descarteDto.fecha_descarte,
      registradoPorId: cliente.id,
    });

    await this.descarteRepo.save(descartes);

    return {
      message: `Ave descartada correctamente del lote ${animal.lote}`,
    };
  }

  async descartarPeces(
    id: string,
    descarteDto: DescarteAnimalDto,
    cliente: Cliente,
  ) {
    const animal = await this.findOne(id);

    if (!animal) {
      throw new NotFoundException(
        'El lote de porcinos que intentas descartar no existe',
      );
    }

    if (!animal.cantidad_actual && animal.cantidad_actual !== 0) {
      throw new BadRequestException(
        'Este animal no tiene una cantidad de lote definida',
      );
    }

    if (descarteDto.cantidad > animal.cantidad_actual) {
      throw new BadRequestException(
        `La cantidad a descartar (${descarteDto.cantidad}) excede la cantidad actual (${animal.cantidad_actual})`,
      );
    }

    const cantidadAnterior = animal.cantidad_actual;
    const cantidadNueva = cantidadAnterior - descarteDto.cantidad;

    animal.descartado = descarteDto.descartado ?? true;
    animal.razon_descarte = descarteDto.razon_descarte ?? 'N/D';
    animal.fecha_descarte = descarteDto.fecha_descarte;
    animal.descartadoPorId = cliente.id;
    animal.cantidad_actual = cantidadNueva;

    const animal_save = await this.animalRepo.save(animal);

    const descartes = this.descarteRepo.create({
      animalId: animal_save.id,
      razon_descarte: descarteDto.razon_descarte,
      cantidad: descarteDto.cantidad,
      fecha_descarte: descarteDto.fecha_descarte,
      registradoPorId: cliente.id,
    });

    await this.descarteRepo.save(descartes);

    return {
      message: `Ave descartada correctamente del lote ${animal.lote}`,
    };
  }

  async updateDeathStatus(
    id: string,
    mortalidadAnimal: CreateMortalidadAnimalDto,
    cliente: Cliente,
  ) {
    const { muerto, razon_muerte, cantidad, fecha_mortalidad } =
      mortalidadAnimal;

    const animal = await this.animalRepo.findOne({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado`);
    }

    if (!razon_muerte) {
      throw new BadRequestException(
        'Debe proporcionar una razón de muerte cuando el animal ha fallecido',
      );
    }

    animal.animal_muerte = muerto;
    animal.razon_muerte = razon_muerte ?? 'N/D';
    const animal_save = await this.animalRepo.save(animal);

    const mortalidad = this.mortalidadRepo.create({
      animalId: animal_save.id,
      cantidad: cantidad,
      fecha_mortalidad,
      razon_muerte,
      registradoPorId: cliente.id,
    });

    await this.mortalidadRepo.save(mortalidad);

    return 'Mortalidad de Ave Ingresado Correctamente';
  }

  async updateDeathStatusAves(
    id: string,
    mortalidadAnimal: CreateMortalidadAnimalDto,
    cliente: Cliente,
  ) {
    const { razon_muerte, cantidad, fecha_mortalidad, muerto } =
      mortalidadAnimal;

    const animal = await this.animalRepo.findOne({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado`);
    }

    if (!razon_muerte) {
      throw new BadRequestException(
        'Debe proporcionar una razón de muerte cuando el animal ha fallecido',
      );
    }

    if (!animal.cantidad_lote && animal.cantidad_lote !== 0) {
      throw new BadRequestException(
        'Este animal no tiene una cantidad de lote definida',
      );
    }

    if (cantidad > animal.cantidad_lote) {
      throw new BadRequestException(
        `La cantidad a descartar (${cantidad}) excede la cantidad actual (${animal.cantidad_lote})`,
      );
    }

    const cantidadAnterior = animal.cantidad_lote;
    const cantidadNueva = cantidadAnterior - cantidad;

    animal.animal_muerte = muerto ?? true;
    animal.razon_muerte = razon_muerte ?? 'N/D';
    animal.cantidad_lote = cantidadNueva;

    const animal_save = await this.animalRepo.save(animal);

    const mortalidad = this.mortalidadRepo.create({
      animalId: animal_save.id,
      cantidad: cantidad,
      fecha_mortalidad,
      razon_muerte,
      registradoPorId: cliente.id,
    });

    await this.mortalidadRepo.save(mortalidad);

    return 'Mortalidad de Ave Ingresado Correctamente';
  }

  async updateDeathStatusPeces(
    id: string,
    mortalidadAnimal: CreateMortalidadAnimalDto,
    cliente: Cliente,
  ) {
    const { razon_muerte, cantidad, fecha_mortalidad, muerto } =
      mortalidadAnimal;

    const animal = await this.animalRepo.findOne({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado`);
    }

    if (!razon_muerte) {
      throw new BadRequestException(
        'Debe proporcionar una razón de muerte cuando el animal ha fallecido',
      );
    }

    if (!animal.cantidad_actual && animal.cantidad_actual !== 0) {
      throw new BadRequestException(
        'Este animal no tiene una cantidad de lote definida',
      );
    }

    if (cantidad > animal.cantidad_actual) {
      throw new BadRequestException(
        `La cantidad a descartar (${cantidad}) excede la cantidad actual (${animal.cantidad_actual})`,
      );
    }

    const cantidadAnterior = animal.cantidad_actual;
    const cantidadNueva = cantidadAnterior - cantidad;

    animal.animal_muerte = muerto ?? true;
    animal.razon_muerte = razon_muerte ?? 'N/D';
    animal.cantidad_actual = cantidadNueva;

    const animal_save = await this.animalRepo.save(animal);

    const mortalidad = this.mortalidadRepo.create({
      animalId: animal_save.id,
      cantidad: cantidad,
      fecha_mortalidad,
      razon_muerte,
      registradoPorId: cliente.id,
    });

    await this.mortalidadRepo.save(mortalidad);

    return 'Mortalidad de Peces Ingresado Correctamente';
  }

  remove(id: number) {
    return `This action removes a #${id} animalFinca`;
  }
}
