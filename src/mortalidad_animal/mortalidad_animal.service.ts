import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MortalidadAnimal } from './entities/mortalidad_animal.entity';
import { Repository } from 'typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';

@Injectable()
export class MortalidadAnimalService {
  constructor(
    @InjectRepository(MortalidadAnimal)
    private readonly mortalidadRepo: Repository<MortalidadAnimal>,
  ) {}

  async obtenerMortalidadPorMesYEspecie(
    cliente: Cliente,
    paginationDto: PaginationDto,
  ) {
    const propietarioId = getPropietarioId(cliente);
    const { mes, fincaId } = paginationDto;

    const query = this.mortalidadRepo
      .createQueryBuilder('mortalidad')
      .innerJoin('mortalidad.animal', 'animal')
      .innerJoin('animal.finca', 'finca')
      .innerJoin('animal.especie', 'especie')
      .where('animal.propietarioId = :propietarioId', { propietarioId })
      .select('especie.id', 'especieId')
      .addSelect('especie.nombre', 'especie')
      .addSelect('SUM(mortalidad.cantidad)', 'cantidad');

    if (mes) {
      query.andWhere(`TO_CHAR(mortalidad.fecha_mortalidad, 'YYYY-MM') = :mes`, {
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
