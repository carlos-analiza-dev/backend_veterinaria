import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProduccionFincaDto } from './dto/create-produccion_finca.dto';
import { UpdateProduccionFincaDto } from './dto/update-produccion_finca.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FincasGanadero } from '../fincas_ganadero/entities/fincas_ganadero.entity';
import { Repository } from 'typeorm';
import { ProduccionFinca } from './entities/produccion_finca.entity';
import { ProduccionAgricola } from '../produccion_agricola/entities/produccion_agricola.entity';
import { ProduccionAlternativa } from '../produccion_alternativa/entities/produccion_alternativa.entity';
import { ProduccionGanadera } from '../produccion_ganadera/entities/produccion_ganadera.entity';
import { ProduccionForrajesInsumo } from '../produccion_forrajes_insumos/entities/produccion_forrajes_insumo.entity';
import { User } from '../auth/entities/auth.entity';
import { ProduccionApicultura } from 'src/produccion_apicultura/entities/produccion_apicultura.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProduccionFincaService {
  constructor(
    @InjectRepository(FincasGanadero)
    private readonly finca_ganadero_repo: Repository<FincasGanadero>,
    @InjectRepository(ProduccionFinca)
    private readonly produccion_finca_repo: Repository<ProduccionFinca>,
    @InjectRepository(ProduccionAgricola)
    private readonly produccion_agricola_repo: Repository<ProduccionAgricola>,
    @InjectRepository(ProduccionAlternativa)
    private readonly produccion_alternativa_repo: Repository<ProduccionAlternativa>,
    @InjectRepository(ProduccionGanadera)
    private readonly produccion_ganadera_repo: Repository<ProduccionGanadera>,
    @InjectRepository(ProduccionForrajesInsumo)
    private readonly produccion_forrajes_rep: Repository<ProduccionForrajesInsumo>,
    @InjectRepository(ProduccionApicultura)
    private readonly produccion_apicultura_rep: Repository<ProduccionApicultura>,
    @InjectRepository(User)
    private readonly usuario_rep: Repository<User>,
  ) {}

  async create(createProduccionFincaDto: CreateProduccionFincaDto) {
    const {
      fincaId,
      userId,
      agricola,
      alternativa,
      consumo_propio,
      forrajesInsumo,
      ganadera,
      apicultura,
      produccion_mixta,
      produccion_venta,
      transformacion_artesanal,
    } = createProduccionFincaDto;

    try {
      const finca_exist = await this.finca_ganadero_repo.findOne({
        where: { id: fincaId },
        relations: ['propietario'],
      });
      if (!finca_exist) {
        throw new NotFoundException('No se encontró la finca');
      }

      const propietario_exist = await this.usuario_rep.findOne({
        where: { id: userId },
      });
      if (!propietario_exist) {
        throw new NotFoundException(
          'No se encontró el propietario de la finca',
        );
      }

      if (finca_exist.propietario.id !== userId) {
        throw new BadRequestException(
          'El usuario no es propietario de esta finca',
        );
      }

      const existeProduccion = await this.produccion_finca_repo.findOne({
        where: { finca: { id: fincaId } },
      });
      if (existeProduccion) {
        throw new ConflictException(
          'La finca ya tiene un registro de producción',
        );
      }

      const hasValidGanadera = ganadera?.tiposProduccion?.length > 0;
      const hasValidApicultura = apicultura?.numero_colmenas > 0;
      const hasValidAgricola = agricola?.cultivos?.some(
        (c) => c.tipo && c.estacionalidad && c.tiempo_estimado_cultivo,
      );
      const hasValidForrajes = forrajesInsumo?.insumos?.some(
        (i) => i.tipo && (i.tipo !== 'Heno' || i.tipo_heno),
      );
      const hasValidAlternativa = alternativa?.actividades?.some(
        (a) => a.tipo && a.cantidad_producida,
      );

      if (
        !hasValidGanadera &&
        !hasValidApicultura &&
        !hasValidAgricola &&
        !hasValidForrajes &&
        !hasValidAlternativa
      ) {
        throw new BadRequestException(
          'Debe proporcionar al menos una sección de producción con datos válidos',
        );
      }

      const produccion = this.produccion_finca_repo.create({
        finca: { id: fincaId },
        propietario: { id: userId },
        produccion_mixta: produccion_mixta ?? false,
        transformacion_artesanal: transformacion_artesanal ?? false,
        consumo_propio: consumo_propio ?? false,
        produccion_venta: produccion_venta ?? false,
      });

      if (hasValidGanadera) {
        produccion.ganadera = await this.produccion_ganadera_repo.save(
          this.produccion_ganadera_repo.create(ganadera),
        );
      }

      if (hasValidApicultura) {
        produccion.apicultura = await this.produccion_apicultura_rep.save(
          this.produccion_apicultura_rep.create(apicultura),
        );
      }

      if (hasValidAgricola) {
        const cultivos = agricola.cultivos
          .filter(
            (c) => c.tipo && c.estacionalidad && c.tiempo_estimado_cultivo,
          )
          .map((c) => ({
            tipo: c.tipo,
            descripcion: c.descripcion,
            estacionalidad: c.estacionalidad,
            tiempo_estimado_cultivo: c.tiempo_estimado_cultivo,
            meses_produccion: c.meses_produccion,
            cantidad_producida_hectareas: c.cantidad_producida_hectareas,
          }));

        if (cultivos.length > 0) {
          produccion.agricola = await this.produccion_agricola_repo.save(
            this.produccion_agricola_repo.create({ cultivos }),
          );
        }
      }

      if (hasValidForrajes) {
        const insumos = forrajesInsumo.insumos
          .filter((i) => i.tipo && (i.tipo !== 'Heno' || i.tipo_heno))
          .map((i) => ({
            tipo: i.tipo,
            tipo_heno: i.tipo_heno,
            estacionalidad_heno: i.estacionalidad_heno,
            meses_produccion_heno: i.meses_produccion_heno,
            tiempo_estimado_cultivo: i.tiempo_estimado_cultivo,
            produccion_manzana: i.produccion_manzana,
            descripcion_otro: i.descripcion_otro,
          }));

        if (insumos.length > 0) {
          produccion.forrajesInsumo = await this.produccion_forrajes_rep.save(
            this.produccion_forrajes_rep.create({ insumos }),
          );
        }
      }

      if (hasValidAlternativa) {
        const actividades = alternativa.actividades
          .filter((a) => a.tipo && a.cantidad_producida)
          .map((a) => ({
            tipo: a.tipo,

            cantidad_producida: a.cantidad_producida,
            unidad_medida: a.unidad_medida,
            ingresos_anuales: a.ingresos_anuales,
          }));

        if (actividades.length > 0) {
          produccion.alternativa = await this.produccion_alternativa_repo.save(
            this.produccion_alternativa_repo.create({ actividades }),
          );
        }
      }

      await this.produccion_finca_repo.save(produccion);
      return 'Producción creada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.produccion_finca_repo.find({
        relations: [
          'finca',
          'propietario',
          'ganadera',
          'agricola',
          'forrajesInsumo',
          'alternativa',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las producciones',
      );
    }
  }

  async findOne(id: string) {
    try {
      const produccion = await this.produccion_finca_repo.findOne({
        where: { id },
        relations: ['finca', 'propietario'],
      });

      if (!produccion) throw new NotFoundException('Producción no encontrada');

      delete produccion.propietario.password;

      return produccion;
    } catch (error) {
      throw error;
    }
  }

  async GetByUserId(id: string) {
    try {
      const propietario_exist = await this.usuario_rep.findOne({
        where: { id },
      });
      if (!propietario_exist)
        throw new NotFoundException(
          'No se encontro el propietario de estas producciones',
        );

      const producciones = await this.produccion_finca_repo.find({
        where: { propietario: { id } },
        relations: ['finca', 'propietario'],
      });

      if (!producciones || producciones.length === 0)
        throw new NotFoundException('No se encontraron producciones');

      return instanceToPlain(producciones);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateProduccionFincaDto: UpdateProduccionFincaDto) {
    try {
      const produccion = await this.produccion_finca_repo.findOne({
        where: { id },
        relations: ['ganadera', 'agricola', 'forrajesInsumo', 'alternativa'],
      });

      if (!produccion) {
        throw new NotFoundException(`Producción con ID ${id} no encontrada`);
      }

      if (updateProduccionFincaDto.produccion_mixta !== undefined) {
        produccion.produccion_mixta = updateProduccionFincaDto.produccion_mixta;
      }
      if (updateProduccionFincaDto.transformacion_artesanal !== undefined) {
        produccion.transformacion_artesanal =
          updateProduccionFincaDto.transformacion_artesanal;
      }
      if (updateProduccionFincaDto.consumo_propio !== undefined) {
        produccion.consumo_propio = updateProduccionFincaDto.consumo_propio;
      }
      if (updateProduccionFincaDto.produccion_venta !== undefined) {
        produccion.produccion_venta = updateProduccionFincaDto.produccion_venta;
      }

      if (updateProduccionFincaDto.ganadera) {
        if (produccion.ganadera) {
          await this.produccion_ganadera_repo.update(
            produccion.ganadera.id,
            updateProduccionFincaDto.ganadera,
          );
        } else {
          produccion.ganadera = await this.produccion_ganadera_repo.save(
            this.produccion_ganadera_repo.create(
              updateProduccionFincaDto.ganadera,
            ),
          );
        }
      }

      if (updateProduccionFincaDto.agricola?.cultivos) {
        const cultivos = updateProduccionFincaDto.agricola.cultivos.map(
          (c) => ({
            tipo: c.tipo,
            descripcion: c.descripcion,
            estacionalidad: c.estacionalidad,
            tiempo_estimado_cultivo: c.tiempo_estimado_cultivo,
            meses_produccion: c.meses_produccion,
            cantidad_producida_hectareas: c.cantidad_producida_hectareas,
          }),
        );

        if (produccion.agricola) {
          await this.produccion_agricola_repo.update(produccion.agricola.id, {
            cultivos,
          });
        } else {
          produccion.agricola = await this.produccion_agricola_repo.save(
            this.produccion_agricola_repo.create({ cultivos }),
          );
        }
      }

      if (updateProduccionFincaDto.forrajesInsumo?.insumos) {
        const insumos = updateProduccionFincaDto.forrajesInsumo.insumos.map(
          (i) => ({
            tipo: i.tipo,
            tipo_heno: i.tipo_heno,
            estacionalidad_heno: i.estacionalidad_heno,
            meses_produccion_heno: i.meses_produccion_heno,
            tiempo_estimado_cultivo: i.tiempo_estimado_cultivo,
            produccion_manzana: i.produccion_manzana,
            descripcion_otro: i.descripcion_otro,
          }),
        );

        if (produccion.forrajesInsumo) {
          await this.produccion_forrajes_rep.update(
            produccion.forrajesInsumo.id,
            { insumos },
          );
        } else {
          produccion.forrajesInsumo = await this.produccion_forrajes_rep.save(
            this.produccion_forrajes_rep.create({ insumos }),
          );
        }
      }

      if (updateProduccionFincaDto.alternativa?.actividades) {
        const actividades =
          updateProduccionFincaDto.alternativa.actividades.map((a) => ({
            tipo: a.tipo,

            cantidad_producida: a.cantidad_producida,
            unidad_medida: a.unidad_medida,
            ingresos_anuales: a.ingresos_anuales,
          }));

        if (produccion.alternativa) {
          await this.produccion_alternativa_repo.update(
            produccion.alternativa.id,
            { actividades },
          );
        } else {
          produccion.alternativa = await this.produccion_alternativa_repo.save(
            this.produccion_alternativa_repo.create({ actividades }),
          );
        }
      }

      await this.produccion_finca_repo.save(produccion);

      return this.produccion_finca_repo.findOne({
        where: { id },
        relations: [
          'finca',
          'propietario',
          'ganadera',
          'agricola',
          'forrajesInsumo',
          'alternativa',
        ],
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar la producción',
      );
    }
  }

  async remove(id: string) {
    try {
      const produccion = await this.produccion_finca_repo.findOne({
        where: { id },
        relations: ['ganadera', 'agricola', 'forrajesInsumo', 'alternativa'],
      });

      if (!produccion) {
        throw new NotFoundException(`Producción con ID ${id} no encontrada`);
      }

      if (produccion.ganadera) {
        await this.produccion_ganadera_repo.remove(produccion.ganadera);
      }
      if (produccion.agricola) {
        await this.produccion_agricola_repo.remove(produccion.agricola);
      }
      if (produccion.forrajesInsumo) {
        await this.produccion_forrajes_rep.remove(produccion.forrajesInsumo);
      }
      if (produccion.alternativa) {
        await this.produccion_alternativa_repo.remove(produccion.alternativa);
      }

      await this.produccion_finca_repo.remove(produccion);

      return { message: `Producción con ID ${id} eliminada correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la producción');
    }
  }
}
