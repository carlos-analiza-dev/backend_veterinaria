import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePartoAnimalDto } from './dto/create-parto_animal.dto';
import { UpdatePartoAnimalDto } from './dto/update-parto_animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PartoAnimal } from './entities/parto_animal.entity';
import { Repository } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { EstadoCeloAnimal } from 'src/interfaces/celos.animal.enum';
import { EstadoCria } from 'src/interfaces/partos.enums';
import { PartoAnimalValidationService } from './parto_animal.validation.service';

@Injectable()
export class PartoAnimalService {
  constructor(
    @InjectRepository(PartoAnimal)
    private readonly partoRepository: Repository<PartoAnimal>,
    @InjectRepository(AnimalFinca)
    private readonly animalRepository: Repository<AnimalFinca>,
    @InjectRepository(ServicioReproductivo)
    private readonly servicioRepository: Repository<ServicioReproductivo>,
    @InjectRepository(CelosAnimal)
    private readonly celoRepository: Repository<CelosAnimal>,
    private validationService: PartoAnimalValidationService,
  ) {}
  async create(createPartoAnimalDto: CreatePartoAnimalDto) {
    try {
      const { hembra, servicio } =
        await this.validationService.validarTodasLasValidacionesParto(
          createPartoAnimalDto.hembra_id,
          createPartoAnimalDto.servicio_id,
          createPartoAnimalDto.fecha_parto,
          createPartoAnimalDto.numero_crias,
          createPartoAnimalDto.crias,
        );

      let diasGestacion = createPartoAnimalDto.dias_gestacion;
      let semanasGestacion = createPartoAnimalDto.semanas_gestacion;

      if (servicio && !diasGestacion) {
        const fechaServicio = new Date(servicio.fecha_servicio);
        const fechaParto = new Date(createPartoAnimalDto.fecha_parto);
        diasGestacion = Math.round(
          (fechaParto.getTime() - fechaServicio.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        semanasGestacion = Math.round(diasGestacion / 7);
      }

      const numeroCrias =
        createPartoAnimalDto.numero_crias ||
        createPartoAnimalDto.crias?.length ||
        1;

      const numeroCriasVivas =
        createPartoAnimalDto.numero_crias_vivas ||
        createPartoAnimalDto.crias?.filter((c) => c.estado === EstadoCria.VIVA)
          .length ||
        0;

      const numeroCriasMuertas =
        createPartoAnimalDto.numero_crias_muertas ||
        createPartoAnimalDto.crias?.filter(
          (c) => c.estado === EstadoCria.MUERTA,
        ).length ||
        0;

      const parto = this.partoRepository.create({
        ...createPartoAnimalDto,
        hembra,
        servicio_asociado: servicio,
        numero_crias: numeroCrias,
        numero_crias_vivas: numeroCriasVivas,
        numero_crias_muertas: numeroCriasMuertas,
        dias_gestacion: diasGestacion,
        semanas_gestacion: semanasGestacion,
      });

      const partoGuardado = await this.partoRepository.save(parto);

      await this.animalRepository.save(hembra);

      if (servicio) {
        servicio.exitoso = true;
        await this.servicioRepository.save(servicio);

        if (servicio.celo_asociado) {
          servicio.celo_asociado.estado = EstadoCeloAnimal.PREÑADO;
          await this.celoRepository.save(servicio.celo_asociado);
        }
      }

      return partoGuardado;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Error al crear parto:', error);
      throw new BadRequestException('Error al crear el registro de parto');
    }
  }

  findAll() {
    return `This action returns all partoAnimal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} partoAnimal`;
  }

  update(id: number, updatePartoAnimalDto: UpdatePartoAnimalDto) {
    return `This action updates a #${id} partoAnimal`;
  }

  remove(id: number) {
    return `This action removes a #${id} partoAnimal`;
  }
}
