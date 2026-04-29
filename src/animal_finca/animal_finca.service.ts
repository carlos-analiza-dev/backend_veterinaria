import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAnimalFincaDto } from './dto/create-animal_finca.dto';
import { UpdateAnimalFincaDto } from './dto/update-animal_finca.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalFinca } from './entities/animal_finca.entity';
import { In, Repository } from 'typeorm';
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
  ) {}

  async create(createAnimalFincaDto: CreateAnimalFincaDto, cliente: Cliente) {
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
      tipo_reproduccion,
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
        relations: ['animales', 'animales.especie', 'propietario'],
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

      if (finca.especies_maneja && finca.especies_maneja.length > 0) {
        const configEspecie = finca.especies_maneja.find(
          (e) => e.especie === especie_animal.nombre,
        );

        if (configEspecie) {
          const animalesExistentes = finca.animales.filter(
            (a) => a.especie.id === especie,
          ).length;

          if (animalesExistentes >= configEspecie.cantidad) {
            throw new ConflictException(
              `No se pueden agregar más animales de la especie ${especie_animal.nombre}. ` +
                `Límite en finca seleccionada: ${configEspecie.cantidad}`,
            );
          }
        } else {
          throw new BadRequestException(
            `La especie ${especie_animal.nombre} no está configurada para esta finca`,
          );
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

      const razasPadre = await this.razaAnimal.findBy({ id: In(razas_padre) });
      if (razasPadre.length !== razas_padre.length) {
        throw new NotFoundException(
          'Una o más razas del padre no fueron encontradas.',
        );
      }

      const razasMadre = await this.razaAnimal.findBy({ id: In(razas_madre) });
      if (razasMadre.length !== razas_madre.length) {
        throw new NotFoundException(
          'Una o más razas de la madre no fueron encontradas.',
        );
      }

      const existeIdentificador = await this.animalRepo.findOneBy({
        identificador,
      });
      if (existeIdentificador) {
        throw new ConflictException('El identificador ya está en uso');
      }

      let edadCalculada: number | null = null;
      if (fecha_nacimiento) {
        const nacimiento = new Date(fecha_nacimiento);
        const hoy = new Date();
        let años = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        const dia = hoy.getDate() - nacimiento.getDate();

        if (mes < 0 || (mes === 0 && dia < 0)) {
          años--;
        }
        edadCalculada = años;
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

      const nuevoAnimal = this.animalRepo.create({
        color,
        especie: especie_animal,
        identificador,
        razas,
        sexo,
        produccion,
        tipo_produccion,
        edad_promedio: edadCalculada,
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
        nombre_padre,
        arete_padre,
        razas_padre: razasPadre,
        pureza_padre,
        nombre_criador_padre,
        nombre_propietario_padre,
        nombre_finca_origen_padre,
        arete_madre,
        nombre_criador_madre,
        nombre_finca_origen_madre,
        nombre_madre,
        nombre_propietario_madre,
        numero_parto_madre,
        razas_madre: razasMadre,
        pureza_madre,
      });

      await this.animalRepo.save(nuevoAnimal);

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

  async findAll(
    cliente: Cliente,
    propietarioId: string,
    paginationDto: PaginationDto,
  ) {
    const {
      fincaId,
      identificador,
      especieId,
      limit = 5,
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
        query.andWhere('LOWER(animal.identificador) LIKE :identificador', {
          identificador: `%${identificador.toLowerCase()}%`,
        });
      }

      if (name && name.trim() !== '') {
        query.andWhere('LOWER(animal.identificador) LIKE :name', {
          name: `%${name.toLowerCase()}%`,
        });
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
      numero_parto_madre,
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

      if (fecha_nacimiento !== undefined) {
        let edadCalculada: number | null = null;
        if (fecha_nacimiento) {
          const nacimiento = new Date(fecha_nacimiento);
          const hoy = new Date();
          let años = hoy.getFullYear() - nacimiento.getFullYear();
          const mes = hoy.getMonth() - nacimiento.getMonth();
          const dia = hoy.getDate() - nacimiento.getDate();

          if (mes < 0 || (mes === 0 && dia < 0)) {
            años--;
          }
          edadCalculada = años;
        }

        const fecha = new Date(fecha_nacimiento);
        if (isNaN(fecha.getTime())) {
          throw new BadRequestException('Fecha de nacimiento inválida');
        }
        animal.fecha_nacimiento = fecha;
        animal.edad_promedio = edadCalculada;
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

      if (nombre_padre !== undefined) animal.nombre_padre = nombre_padre;
      if (arete_padre !== undefined) animal.arete_padre = arete_padre;
      if (nombre_criador_padre !== undefined)
        animal.nombre_criador_padre = nombre_criador_padre;
      if (nombre_propietario_padre !== undefined)
        animal.nombre_propietario_padre = nombre_propietario_padre;
      if (nombre_finca_origen_padre !== undefined)
        animal.nombre_finca_origen_padre = nombre_finca_origen_padre;
      if (pureza_padre !== undefined) animal.pureza_padre = pureza_padre;

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

      await this.animalRepo.save({ ...animal, actualizado_por: cliente });

      return {
        message: 'Animal actualizado correctamente',
        animal: instanceToPlain(animal),
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
