import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMarketplaceAnimaleDto } from './dto/create-marketplace_animale.dto';
import { UpdateMarketplaceAnimaleDto } from './dto/update-marketplace_animale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketplaceAnimale } from './entities/marketplace_animale.entity';
import { Brackets, Repository } from 'typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { MarketplaceAnimalesImage } from 'src/marketplace_animales_images/entities/marketplace_animales_image.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { TipoProducto } from 'src/tipo_producto/entities/tipo_producto.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { DistanceSucursalesService } from 'src/distance_sucursales/distance_sucursales.service';
import { NearbySucursalesDto } from 'src/common/dto/nearby-sucursales.dto';
import { FilterMarketplaceAnimalesDto } from './dto/filter-market-place.dto';

@Injectable()
export class MarketplaceAnimalesService {
  constructor(
    @InjectRepository(MarketplaceAnimale)
    private readonly marketAnimalRepo: Repository<MarketplaceAnimale>,
    @InjectRepository(Categoria)
    private readonly categoryRepo: Repository<Categoria>,
    @InjectRepository(Subcategoria)
    private readonly subcategoriaRepo: Repository<Subcategoria>,
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(MarketplaceAnimalesImage)
    private readonly marketImagesAnimales: Repository<MarketplaceAnimalesImage>,
    @InjectRepository(AnimalFinca)
    private readonly animalRepo: Repository<AnimalFinca>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,
    @InjectRepository(TipoProducto)
    private readonly tipoRepo: Repository<TipoProducto>,
    private distanceService: DistanceSucursalesService,
  ) {}

  async create(
    createMarketplaceAnimaleDto: CreateMarketplaceAnimaleDto,
    files: Express.Multer.File[],
    cliente: Cliente,
  ) {
    const {
      animalId,
      categoriaId,
      subcategoriaId,
      marcaId,
      tipoProductoId,
      departamentoId,
      longitud,
      latitud,
      tipo_publicacion,
      direccion_completa,
      ...restoDatos
    } = createMarketplaceAnimaleDto;

    const paisId = cliente.pais.id ?? '';
    const moneda = cliente.pais.simbolo_moneda;

    try {
      const animal = await this.animalRepo.findOne({
        where: {
          id: animalId,
          animal_muerte: false,
        },
      });

      if (!animal) {
        throw new NotFoundException('No se encontró el animal seleccionado');
      }

      const publicacionExistente = await this.marketAnimalRepo.findOne({
        where: {
          animal: {
            id: animalId,
          },
          disponible: true,
          vendido: false,
        },
        relations: {
          animal: true,
        },
      });

      if (publicacionExistente) {
        throw new BadRequestException(
          'Este animal ya tiene una publicación activa en el marketplace',
        );
      }

      const pais = await this.paisRepo.findOne({
        where: {
          id: paisId,
        },
      });

      if (!pais) {
        throw new NotFoundException('No se encontró el país seleccionado');
      }

      const depto = await this.departamentoRepo.findOne({
        where: {
          id: departamentoId,
        },
      });

      if (!depto) {
        throw new NotFoundException(
          'No se encontró el departamento seleccionado',
        );
      }

      const categoria = await this.categoryRepo.findOne({
        where: {
          id: categoriaId,
        },
      });

      if (!categoria) {
        throw new NotFoundException('No se encontró la categoría seleccionada');
      }

      const subcategoria = await this.subcategoriaRepo.findOne({
        where: {
          id: subcategoriaId,
        },
      });

      if (!subcategoria) {
        throw new NotFoundException(
          'No se encontró la subcategoría seleccionada',
        );
      }

      if (!files || files.length === 0)
        throw new BadRequestException(
          'Se necesita al menos una fotografia para poder subir este producto',
        );

      let marca = null;

      if (marcaId) {
        marca = await this.marcaRepo.findOne({
          where: {
            id: marcaId,
          },
        });

        if (!marca) {
          throw new NotFoundException('No se encontró la marca seleccionada');
        }
      }

      let tipoProducto = null;

      if (tipoProductoId) {
        tipoProducto = await this.tipoRepo.findOne({
          where: {
            id: tipoProductoId,
          },
        });

        if (!tipoProducto) {
          throw new NotFoundException(
            'No se encontró el tipo de producto seleccionado',
          );
        }
      }

      const nuevoProducto = this.marketAnimalRepo.create({
        animal,
        categoria,
        subcategoria,
        marca,
        longitud,
        latitud,
        direccion_completa,
        tipo_publicacion,

        tipo_producto: tipoProducto,

        vendedor: { id: cliente.id },

        pais: {
          id: paisId,
        },

        departamento: {
          id: departamentoId,
        },

        nombre: restoDatos.nombre,
        descripcion: restoDatos.descripcion,
        precio: restoDatos.precio,
        precio_oferta: restoDatos.precio_oferta,
        moneda: moneda,
        stock: restoDatos.stock,
        disponible: restoDatos.disponible ?? true,
        modelo: restoDatos.modelo,
      });

      const productoGuardado = await this.marketAnimalRepo.save(nuevoProducto);

      if (files && files.length > 0) {
        const uploadDir = path.join(
          __dirname,
          '..',
          '..',
          'uploads',
          'fotos_animales_market',
        );

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, {
            recursive: true,
          });
        }

        const baseUrl = process.env.APP_URL;

        const imagenes: MarketplaceAnimalesImage[] = [];

        for (const file of files) {
          const fileExt = path.extname(file.originalname);

          const fileName = `${uuidv4()}${fileExt}`;

          const filePath = path.join(uploadDir, fileName);

          await fs.promises.writeFile(filePath, file.buffer);

          const fileUrl = `${baseUrl}/uploads/fotos_animales_market/${fileName}`;

          const imagen = this.marketImagesAnimales.create({
            url: fileUrl,
            key: fileName,
            mimeType: file.mimetype,

            animal: productoGuardado,
          });

          imagenes.push(imagen);
        }

        await this.marketImagesAnimales.save(imagenes);
      }

      await this.marketAnimalRepo.findOne({
        where: {
          id: productoGuardado.id,
        },
      });

      return 'Producto creado exitosamente en el marketplace';
    } catch (error) {
      throw error;
    }
  }

  async findAll(cliente: Cliente, nearbyDto: NearbySucursalesDto) {
    const {
      latitud,
      longitud,
      radio,
      usarGoogleMaps = false,
      especie,
      limit = 12,
      offset = 0,
    } = nearbyDto;

    const query = this.marketAnimalRepo
      .createQueryBuilder('marketplace')
      .leftJoinAndSelect('marketplace.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .leftJoinAndSelect('marketplace.categoria', 'categoria')
      .leftJoinAndSelect('marketplace.subcategoria', 'subcategoria')
      .leftJoinAndSelect('marketplace.marca', 'marca')
      .leftJoinAndSelect('marketplace.tipo_producto', 'tipo_producto')
      .leftJoinAndSelect('marketplace.vendedor', 'vendedor')
      .leftJoinAndSelect('marketplace.pais', 'pais')
      .leftJoinAndSelect('marketplace.departamento', 'departamento')
      .leftJoinAndSelect('marketplace.marketAnimalImages', 'imagenes')
      .where('marketplace.disponible = :disponible', { disponible: true })
      .andWhere('marketplace.latitud IS NOT NULL')
      .andWhere('marketplace.longitud IS NOT NULL')
      .andWhere('animal.animal_muerte = :muerte', { muerte: false })
      .andWhere('vendedor.id != :clienteId', { clienteId: cliente.id });

    if (especie && especie.trim() !== '') {
      query.andWhere('especie.nombre ILIKE :especie', {
        especie: especie,
      });
    }

    query.take(limit).skip(offset);

    const [data, total] = await query.getManyAndCount();

    const productosConDistancia = [];

    for (const producto of data) {
      let distancia = 0;
      let tiempoEstimado = null;

      if (usarGoogleMaps) {
        try {
          const result = await this.distanceService.calculateDistance(
            latitud,
            longitud,
            producto.latitud,
            producto.longitud,
          );

          distancia = result.distance;
          tiempoEstimado = result.duration;
        } catch {
          distancia = this.distanceService.calculateHaversineDistance(
            latitud,
            longitud,
            producto.latitud,
            producto.longitud,
          );
        }
      } else {
        distancia = this.distanceService.calculateHaversineDistance(
          latitud,
          longitud,
          producto.latitud,
          producto.longitud,
        );
      }

      const distanciaLineaRecta =
        this.distanceService.calculateHaversineDistance(
          latitud,
          longitud,
          producto.latitud,
          producto.longitud,
        );

      if (distancia <= radio) {
        productosConDistancia.push({
          ...this.mappingMarketAnimales(producto),
          distancia_km: Number(distancia.toFixed(2)),
          tiempo_estimado_minutos: tiempoEstimado
            ? Math.round(tiempoEstimado)
            : undefined,
          distancia_linea_recta_km: Number(distanciaLineaRecta.toFixed(2)),
          ubicacion_producto: {
            latitud: producto.latitud,
            longitud: producto.longitud,
            direccion: producto.direccion_completa,
          },
        });
      }
    }

    productosConDistancia.sort((a, b) => a.distancia_km - b.distancia_km);

    const totalFiltered = productosConDistancia.length;

    const productosPaginados = productosConDistancia.slice(
      offset,
      offset + limit,
    );

    return {
      total: totalFiltered,
      limit,
      offset,
      radio_km: radio,
      usando_google_maps: usarGoogleMaps,
      filtros_aplicados: {
        especie: especie || null,
      },
      ubicacion_usuario: {
        latitud,
        longitud,
      },
      productos: productosPaginados,
    };
  }

  async findAllFilters(
    cliente: Cliente,
    filterDto: FilterMarketplaceAnimalesDto,
  ) {
    const {
      categoriaId,
      subcategoriaId,
      tipoProductoId,
      limit = 12,
      offset = 0,
    } = filterDto;

    const query = this.marketAnimalRepo
      .createQueryBuilder('marketplace')
      .leftJoinAndSelect('marketplace.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .leftJoinAndSelect('marketplace.categoria', 'categoria')
      .leftJoinAndSelect('marketplace.subcategoria', 'subcategoria')
      .leftJoinAndSelect('marketplace.marca', 'marca')
      .leftJoinAndSelect('marketplace.tipo_producto', 'tipo_producto')
      .leftJoinAndSelect('marketplace.vendedor', 'vendedor')
      .leftJoinAndSelect('marketplace.pais', 'pais')
      .leftJoinAndSelect('marketplace.departamento', 'departamento')
      .leftJoinAndSelect('marketplace.marketAnimalImages', 'imagenes')
      .where('marketplace.disponible = :disponible', {
        disponible: true,
      })
      .andWhere('animal.animal_muerte = :muerte', {
        muerte: false,
      })
      .andWhere('vendedor.id != :clienteId', {
        clienteId: cliente.id,
      })
      .andWhere('pais.id = :paisId', {
        paisId: cliente.pais.id,
      });

    query.andWhere(
      new Brackets((qb) => {
        if (categoriaId) {
          qb.orWhere('categoria.id = :categoriaId', {
            categoriaId,
          });
        }

        if (subcategoriaId) {
          qb.orWhere('subcategoria.id = :subcategoriaId', {
            subcategoriaId,
          });
        }

        if (tipoProductoId) {
          qb.orWhere('tipo_producto.id = :tipoProductoId', {
            tipoProductoId,
          });
        }
      }),
    );

    query.orderBy('marketplace.created_at', 'DESC').take(limit).skip(offset);

    const [data, total] = await query.getManyAndCount();

    return {
      total,
      limit,
      offset,
      filtros_aplicados: {
        categoriaId: categoriaId || null,
        subcategoriaId: subcategoriaId || null,
        tipoProductoId: tipoProductoId || null,
        paisId: cliente.pais.id,
      },
      productos: data.map((producto) => this.mappingMarketAnimales(producto)),
    };
  }

  async findMyPublicaciones(cliente: Cliente, paginationDto: PaginationDto) {
    const { limit = 12, offset = 0 } = paginationDto;
    const query = this.marketAnimalRepo
      .createQueryBuilder('marketplace')
      .leftJoinAndSelect('marketplace.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .leftJoinAndSelect('animal.razas', 'razas')
      .leftJoinAndSelect('marketplace.categoria', 'categoria')
      .leftJoinAndSelect('marketplace.subcategoria', 'subcategoria')
      .leftJoinAndSelect('marketplace.marca', 'marca')
      .leftJoinAndSelect('marketplace.tipo_producto', 'tipo_producto')
      .leftJoinAndSelect('marketplace.vendedor', 'vendedor')
      .leftJoinAndSelect('marketplace.pais', 'pais')
      .leftJoinAndSelect('marketplace.departamento', 'departamento')
      .leftJoinAndSelect('marketplace.marketAnimalImages', 'imagenes')

      .where('vendedor.id = :clienteId', {
        clienteId: cliente.id,
      })

      .andWhere('animal.animal_muerte = false')

      .orderBy('marketplace.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    const [data, total] = await query.getManyAndCount();

    return {
      total,
      limit,
      offset,
      productos: data.map((producto) => this.mappingMarketAnimales(producto)),
    };
  }

  async findOne(id: string, cliente: Cliente) {
    const producto = await this.marketAnimalRepo
      .createQueryBuilder('marketplace')
      .leftJoinAndSelect('marketplace.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .leftJoinAndSelect('animal.razas', 'razas')
      .leftJoinAndSelect('marketplace.categoria', 'categoria')
      .leftJoinAndSelect('marketplace.subcategoria', 'subcategoria')
      .leftJoinAndSelect('marketplace.marca', 'marca')
      .leftJoinAndSelect('marketplace.tipo_producto', 'tipo_producto')
      .leftJoinAndSelect('marketplace.vendedor', 'vendedor')
      .leftJoinAndSelect('marketplace.pais', 'pais')
      .leftJoinAndSelect('marketplace.departamento', 'departamento')
      .leftJoinAndSelect('marketplace.marketAnimalImages', 'imagenes')
      .where('marketplace.id = :id', { id })
      .andWhere('marketplace.disponible = true')
      .andWhere('animal.animal_muerte = false')
      .getOne();

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return this.mappingMarketAnimales(producto);
  }

  update(id: number, updateMarketplaceAnimaleDto: UpdateMarketplaceAnimaleDto) {
    return `This action updates a #${id} marketplaceAnimale`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketplaceAnimale`;
  }

  private mappingMarketAnimales(market: MarketplaceAnimale) {
    return {
      id: market.id,
      nombre: market.nombre,
      descripcion: market.descripcion,
      direccion: market.direccion_completa,
      precio: market.precio,
      precio_oferta: market.precio_oferta,
      moneda: market.moneda,
      stock: market.stock,
      disponible: market.disponible,
      vendido: market.vendido,
      modelo: market.modelo,
      latitud: market.latitud,
      longitud: market.longitud,
      tipo_publicacion: market.tipo_publicacion,
      oferta: market.oferta,
      favoritos: market.favoritos,
      views: market.views,
      created_at: market.created_at,

      imagenes:
        market.marketAnimalImages?.map((img) => ({
          id: img.id,
          url: img.url,
        })) || [],

      animal: {
        id: market.animal?.id,
        identificador: market.animal?.identificador,
        sexo: market.animal?.sexo,
        color: market.animal?.color,
        edad_promedio: market.animal?.edad_promedio,
        tipo_produccion: market.animal?.tipo_produccion,
        produccion: market.animal?.produccion,

        especie: market.animal?.especie
          ? {
              id: market.animal.especie.id,
              nombre: market.animal.especie.nombre,
            }
          : null,

        razas:
          market.animal?.razas?.map((raza) => ({
            id: raza.id,
            nombre: raza.nombre,
          })) || [],
      },

      categoria: market.categoria
        ? {
            id: market.categoria.id,
            nombre: market.categoria.nombre,
          }
        : null,

      subcategoria: market.subcategoria
        ? {
            id: market.subcategoria.id,
            nombre: market.subcategoria.nombre,
          }
        : null,

      marca: market.marca
        ? {
            id: market.marca.id,
            nombre: market.marca.nombre,
          }
        : null,

      tipo_producto: market.tipo_producto
        ? {
            id: market.tipo_producto.id,
            nombre: market.tipo_producto.nombre,
          }
        : null,

      vendedor: market.vendedor
        ? {
            id: market.vendedor.id,
            nombre: market.vendedor.nombre,
            telefono: market.vendedor.telefono,
            create: market.vendedor.createdAt,
            imagenes:
              market.vendedor.profileImages?.map((img) => ({
                id: img.id,
                url: img.url,
              })) || [],
          }
        : null,

      ubicacion: {
        pais: market.pais?.nombre,
        departamento: market.departamento?.nombre,
      },
    };
  }
}
