import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MortalidadAnimal } from './entities/mortalidad_animal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MortalidadAnimalService {
  constructor(
    @InjectRepository(MortalidadAnimal)
    private readonly mortalidadRepo: Repository<MortalidadAnimal>,
  ) {}

  async obtenerMortalidadPorMesYEspecie(paginationDto: PaginationDto) {
    const { mes } = paginationDto;

    const query = this.mortalidadRepo
      .createQueryBuilder('mortalidad')
      .innerJoin('mortalidad.animal', 'animal')
      .innerJoin('animal.especie', 'especie')
      .select('especie.id', 'especieId')
      .addSelect('especie.nombre', 'especie')
      .addSelect('SUM(mortalidad.cantidad)', 'cantidad');

    if (mes) {
      query.where(`TO_CHAR(mortalidad.fecha_mortalidad, 'YYYY-MM') = :mes`, {
        mes,
      });
    }

    return query
      .groupBy('especie.id')
      .addGroupBy('especie.nombre')
      .orderBy('especie.nombre', 'ASC')
      .getRawMany();
  }
}
