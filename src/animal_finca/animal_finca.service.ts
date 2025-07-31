import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimalFincaDto } from './dto/create-animal_finca.dto';
import { UpdateAnimalFincaDto } from './dto/update-animal_finca.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalFinca } from './entities/animal_finca.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';

@Injectable()
export class AnimalFincaService {
  constructor(
    @InjectRepository(AnimalFinca)
    private readonly animalRepo: Repository<AnimalFinca>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(FincasGanadero)
    private readonly fincaRepo: Repository<FincasGanadero>,
    @InjectRepository(EspecieAnimal)
    private readonly especieAnimal: Repository<EspecieAnimal>,
    @InjectRepository(RazaAnimal)
    private readonly razaAnimal: Repository<RazaAnimal>,
  ) {}
  async create(createAnimalFincaDto: CreateAnimalFincaDto) {
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
      const propietario = await this.userRepo.findOneBy({ id: propietarioId });
      if (!propietario) {
        throw new NotFoundException(`Propietario no encontrado`);
      }

      const finca = await this.fincaRepo.findOne({
        where: { id: fincaId },
        relations: ['animales', 'animales.especie'],
      });
      if (!finca) {
        throw new NotFoundException(`Finca no encontrada`);
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

        const años = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        const dia = hoy.getDate() - nacimiento.getDate();

        if (mes < 0 || (mes === 0 && dia < 0)) {
          edadCalculada = años - 1;
        } else {
          edadCalculada = años;
        }
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

      return 'Animal creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const {
      fincaId,
      identificador,
      especieId,
      limit = 5,
      offset = 0,
    } = paginationDto;

    try {
      const propietario = await this.userRepo.findOne({
        where: { id: propietarioId },
      });

      if (!propietario) {
        throw new NotFoundException(
          'No se encontró el propietario seleccionado.',
        );
      }

      const countQuery = this.animalRepo
        .createQueryBuilder('animal')
        .where('animal.propietario = :propietarioId', { propietarioId });

      if (fincaId) {
        countQuery.andWhere('animal.finca = :fincaId', { fincaId });
      }

      if (identificador && identificador.trim() !== '') {
        countQuery.andWhere('LOWER(animal.identificador) LIKE :identificador', {
          identificador: `%${identificador.toLowerCase()}%`,
        });
      }

      if (especieId) {
        countQuery.andWhere('animal.especie = :especieId', { especieId });
      }

      const total = await countQuery.getCount();

      const query = this.animalRepo
        .createQueryBuilder('animal')
        .leftJoinAndSelect('animal.finca', 'finca')
        .leftJoinAndSelect('animal.propietario', 'propietario')
        .leftJoinAndSelect('animal.especie', 'especie')
        .leftJoinAndSelect('animal.razas', 'razas')
        .leftJoinAndSelect('animal.razas_madre', 'razas_madre')
        .leftJoinAndSelect('animal.razas_padre', 'razas_padre')
        .leftJoinAndSelect('animal.profileImages', 'profileImages')
        .where('animal.propietario = :propietarioId', { propietarioId });

      if (fincaId) {
        query.andWhere('animal.finca = :fincaId', { fincaId });
      }

      if (identificador && identificador.trim() !== '') {
        query.andWhere('LOWER(animal.identificador) LIKE :identificador', {
          identificador: `%${identificador.toLowerCase()}%`,
        });
      }

      if (especieId) {
        query.andWhere('animal.especie = :especieId', { especieId });
      }

      const animales = await query
        .orderBy('animal.fecha_registro', 'DESC')
        .addOrderBy('profileImages.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      if (!animales || animales.length === 0) {
        throw new BadRequestException(
          'No se encontraron animales en este momento',
        );
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

  async update(id: string, updateAnimalFincaDto: UpdateAnimalFincaDto) {
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

    const animal = await this.animalRepo.findOne({
      where: { id },
      relations: ['especie', 'razas', 'finca', 'propietario'],
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado`);
    }

    if (especie) {
      const especie_animal = await this.especieAnimal.findOneBy({
        id: especie,
      });
      if (!especie_animal) {
        throw new NotFoundException(`Especie con ID ${especie} no encontrada`);
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

    if (fincaId) {
      const finca = await this.fincaRepo.findOneBy({ id: fincaId });
      if (!finca) {
        throw new NotFoundException(`Finca con ID ${fincaId} no encontrada`);
      }
      animal.finca = finca;
    }

    if (propietarioId) {
      const propietario = await this.userRepo.findOneBy({ id: propietarioId });
      if (!propietario) {
        throw new NotFoundException(
          `Propietario con ID ${propietarioId} no encontrado`,
        );
      }
      animal.propietario = propietario;
    }

    if (color !== undefined) animal.color = color;
    if (sexo !== undefined) animal.sexo = sexo;
    if (identificador !== undefined) animal.identificador = identificador;
    if (edad_promedio !== undefined) animal.edad_promedio = edad_promedio;

    if (fecha_nacimiento !== undefined) {
      let edadCalculada: number | null = null;

      if (fecha_nacimiento) {
        const nacimiento = new Date(fecha_nacimiento);
        const hoy = new Date();

        const años = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        const dia = hoy.getDate() - nacimiento.getDate();

        if (mes < 0 || (mes === 0 && dia < 0)) {
          edadCalculada = años - 1;
        } else {
          edadCalculada = años;
        }
      }

      const fecha = new Date(fecha_nacimiento);
      if (isNaN(fecha.getTime())) {
        throw new BadRequestException('Fecha de nacimiento inválida');
      }
      animal.fecha_nacimiento = fecha;
      animal.edad_promedio = edadCalculada;
    }

    const tieneAlgunAlimento =
      Array.isArray(tipo_alimentacion) && tipo_alimentacion.length > 0;

    if (!tieneAlgunAlimento) {
      throw new BadRequestException(
        'Debe ingresar al menos un tipo de alimento',
      );
    }

    if (!Array.isArray(tipo_alimentacion) || tipo_alimentacion.length === 0) {
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

    if (tipo_alimentacion !== undefined) {
      for (const alimentacion of tipo_alimentacion) {
        if (alimentacion.origen !== 'comprado y producido') {
          delete alimentacion.porcentaje_comprado;
          delete alimentacion.porcentaje_producido;
        }
      }

      animal.tipo_alimentacion = tipo_alimentacion;
    }

    if (observaciones !== undefined) animal.observaciones = observaciones;
    if (medicamento !== undefined) animal.medicamento = medicamento;
    if (tipo_alimentacion !== undefined)
      animal.tipo_alimentacion = tipo_alimentacion;
    if (complementos !== undefined) animal.complementos = complementos;
    if (castrado !== undefined) animal.castrado = castrado;
    if (esterelizado !== undefined) animal.esterelizado = esterelizado;

    if (nombre_padre !== undefined) animal.nombre_padre = nombre_padre;
    if (arete_padre !== undefined) animal.arete_padre = arete_padre;

    if (nombre_criador_padre !== undefined)
      animal.nombre_criador_padre = nombre_criador_padre;
    if (nombre_propietario_padre !== undefined)
      animal.nombre_propietario_padre = nombre_propietario_padre;
    if (nombre_finca_origen_padre !== undefined)
      animal.nombre_finca_origen_padre = nombre_finca_origen_padre;

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
    if (pureza !== undefined) animal.pureza = pureza;
    if (compra_animal !== undefined) animal.compra_animal = compra_animal;
    if (nombre_criador_origen_animal !== undefined)
      animal.nombre_criador_origen_animal = nombre_criador_origen_animal;
    if (pureza_padre !== undefined) animal.pureza_padre = pureza_padre;
    if (pureza_madre !== undefined) animal.pureza_madre = pureza_madre;
    if (tipo_reproduccion !== undefined)
      animal.tipo_reproduccion = tipo_reproduccion;
    if (tipo_produccion !== undefined) animal.tipo_produccion = tipo_produccion;
    if (produccion !== undefined) animal.produccion = produccion;
    if (animal_muerte !== undefined) animal.animal_muerte = animal_muerte;
    if (razon_muerte !== undefined) animal.razon_muerte = razon_muerte;

    await this.animalRepo.save(animal);

    return {
      message: 'Animal actualizado correctamente',
      animal: instanceToPlain(animal),
    };
  }

  remove(id: number) {
    return `This action removes a #${id} animalFinca`;
  }
}
