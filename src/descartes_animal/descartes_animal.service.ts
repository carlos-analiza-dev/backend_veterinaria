import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DescartesAnimal } from './entities/descartes_animal.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class DescartesAnimalService {
  constructor(
    @InjectRepository(DescartesAnimal)
    private readonly descartesRepository: Repository<DescartesAnimal>,
  ) {}
  async obtenerDescartesPorMesYEspecie(paginationDto: PaginationDto) {
    const { mes, fincaId } = paginationDto;

    const query = this.descartesRepository
      .createQueryBuilder('descarte')
      .innerJoin('descarte.animal', 'animal')
      .innerJoin('animal.finca', 'finca')
      .innerJoin('animal.especie', 'especie')
      .select('especie.id', 'especieId')
      .addSelect('especie.nombre', 'especie')
      .addSelect('SUM(descarte.cantidad)', 'cantidad');

    if (mes) {
      query.where(`TO_CHAR(descarte.fecha_descarte, 'YYYY-MM') = :mes`, {
        mes,
      });
    }

    if (fincaId) {
      query.andWhere('finca.id = :fincaId', { fincaId });
    }

    return query
      .groupBy('especie.id')
      .addGroupBy('especie.nombre')
      .orderBy('especie.nombre', 'ASC')
      .getRawMany();
  }
}
