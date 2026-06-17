import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMarketplaceAnimaleDto } from './dto/create-marketplace_animale.dto';
import { UpdateMarketplaceAnimaleDto } from './dto/update-marketplace_animale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketplaceAnimale } from './entities/marketplace_animale.entity';
import { Brackets, In, Repository } from 'typeorm';
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
import { SearchMarketplaceDto } from './dto/searc-market.dto';

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
      let animal;
      if (animalId) {
        animal = await this.animalRepo.findOne({
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
        precioPorDia: restoDatos.precioPorDia,
        precioPorHora: restoDatos.precioPorHora,
        precioPorSemana: restoDatos.precioPorSemana,
        precioPorMes: restoDatos.precioPorMes,
        requiereDeposito: restoDatos.requiereDeposito,
        montoDeposito: restoDatos.montoDeposito,
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
      nombre,
      categoria,
      tipo_publicacion,
      limit = 12,
      offset = 0,
    } = nearbyDto;

    const query = this.marketAnimalRepo
      .createQueryBuilder('marketplace')
      .leftJoinAndSelect(
        'marketplace.animal',
        'animal',
        'animal.animal_muerte = false OR animal.id IS NULL',
      )
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
      .andWhere('marketplace.eliminada = :eliminada', { eliminada: false })
      .andWhere('marketplace.latitud IS NOT NULL')
      .andWhere('marketplace.longitud IS NOT NULL')
      .andWhere('vendedor.id != :clienteId', { clienteId: cliente.id })
      .andWhere(
        `
    (6371 * acos(
      cos(radians(:latitud)) *
      cos(radians(marketplace.latitud)) *
      cos(radians(marketplace.longitud) - radians(:longitud)) +
      sin(radians(:latitud)) *
      sin(radians(marketplace.latitud))
    )) <= :radio
  `,
        { latitud, longitud, radio },
      )
      .take(limit)
      .skip(offset);

    if (especie && especie.trim() !== '') {
      query.andWhere('especie.nombre ILIKE :especie', {
        especie: especie,
      });
    }

    if (nombre && nombre.trim() !== '') {
      query.andWhere('marketplace.nombre ILIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (categoria) {
      query.andWhere('categoria.id = :categoriaId', {
        categoriaId: categoria,
      });
    }

    if (tipo_publicacion) {
      query.andWhere('marketplace.tipo_publicacion = :tipo_publicacion', {
        tipo_publicacion,
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
      .leftJoinAndSelect(
        'marketplace.animal',
        'animal',
        'animal.animal_muerte = false',
      )
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
      .andWhere('marketplace.eliminada = :eliminada', { eliminada: false })
      .andWhere('vendedor.id != :clienteId', { clienteId: cliente.id })
      .andWhere('pais.id = :paisId', { paisId: cliente.pais.id })
      .andWhere(
        new Brackets((qb) => {
          if (categoriaId) {
            qb.andWhere('categoria.id = :categoriaId', { categoriaId });
          }

          if (subcategoriaId) {
            qb.andWhere('subcategoria.id = :subcategoriaId', {
              subcategoriaId,
            });
          }

          if (tipoProductoId) {
            qb.andWhere('tipo_producto.id = :tipoProductoId', {
              tipoProductoId,
            });
          }
        }),
      )
      .orderBy('marketplace.created_at', 'DESC')
      .take(limit)
      .skip(offset);

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

  async searchProducts(cliente: Cliente, searchDto: SearchMarketplaceDto) {
    const { nombre } = searchDto;

    if (!nombre?.trim()) {
      return [];
    }

    const productos = await this.marketAnimalRepo
      .createQueryBuilder('marketplace')
      .select(['marketplace.id', 'marketplace.nombre'])
      .leftJoin('marketplace.vendedor', 'vendedor')
      .where('marketplace.disponible = true')
      .andWhere('marketplace.eliminada = false')
      .andWhere('vendedor.id != :clienteId', {
        clienteId: cliente.id,
      })
      .andWhere('marketplace.nombre ILIKE :nombre', {
        nombre: `%${nombre.trim()}%`,
      })
      .distinct(true)
      .take(10)
      .getMany();

    return productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
    }));
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
      .andWhere('marketplace.eliminada = :eliminada', {
        eliminada: false,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('animal.id IS NULL').orWhere('animal.animal_muerte = false');
        }),
      )

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
      .leftJoinAndSelect('vendedor.paquetes', 'paquetes')
      .leftJoinAndSelect('paquetes.paquete', 'paquete')
      .where('marketplace.id = :id', { id })
      .andWhere('marketplace.eliminada = :eliminada', {
        eliminada: false,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('animal.id IS NULL').orWhere('animal.animal_muerte = false');
        }),
      )
      .andWhere(
        '(marketplace.disponible = true OR marketplace.vendedor.id = :vendedorId)',
        { vendedorId: cliente.id },
      );
    const producto = await query.getOne();

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return this.mappingMarketAnimales(producto);
  }

  async update(
    id: string,
    updateMarketplaceAnimaleDto: UpdateMarketplaceAnimaleDto,
    files: Express.Multer.File[],
    cliente: Cliente,
  ) {
    const {
      categoriaId,
      subcategoriaId,
      marcaId,
      animalId,
      tipoProductoId,
      departamentoId,
      latitud,
      longitud,
      direccion_completa,
      imagenesEliminar,
      ...restoDatos
    } = updateMarketplaceAnimaleDto;

    const publicacion = await this.marketAnimalRepo.findOne({
      where: {
        id,
      },
      relations: {
        vendedor: true,
        marketAnimalImages: true,
      },
    });

    if (!publicacion) {
      throw new NotFoundException('No se encontró la publicación');
    }

    if (publicacion.vendedor.id !== cliente.id) {
      throw new ForbiddenException('No puedes editar esta publicación');
    }

    if (animalId) {
      const animal = await this.animalRepo.findOne({
        where: {
          id: animalId,
          animal_muerte: false,
        },
      });

      if (!animal) {
        throw new NotFoundException('No se encontró el animal seleccionado');
      }

      publicacion.animal = animal;
    }

    if (categoriaId) {
      const categoria = await this.categoryRepo.findOne({
        where: { id: categoriaId },
      });

      if (!categoria) {
        throw new NotFoundException('No se encontró la categoría seleccionada');
      }

      publicacion.categoria = categoria;
    }

    if (subcategoriaId) {
      const subcategoria = await this.subcategoriaRepo.findOne({
        where: { id: subcategoriaId },
      });

      if (!subcategoria) {
        throw new NotFoundException(
          'No se encontró la subcategoría seleccionada',
        );
      }

      publicacion.subcategoria = subcategoria;
    }

    if (marcaId) {
      const marca = await this.marcaRepo.findOne({
        where: { id: marcaId },
      });

      if (!marca) {
        throw new NotFoundException('No se encontró la marca seleccionada');
      }

      publicacion.marca = marca;
    }

    if (tipoProductoId) {
      const tipoProducto = await this.tipoRepo.findOne({
        where: { id: tipoProductoId },
      });

      if (!tipoProducto) {
        throw new NotFoundException(
          'No se encontró el tipo de producto seleccionado',
        );
      }

      publicacion.tipo_producto = tipoProducto;
    }

    if (departamentoId) {
      const departamento = await this.departamentoRepo.findOne({
        where: { id: departamentoId },
      });

      if (!departamento) {
        throw new NotFoundException(
          'No se encontró el departamento seleccionado',
        );
      }

      publicacion.departamento = departamento;
    }

    Object.assign(publicacion, {
      ...restoDatos,
      latitud,
      longitud,
      direccion_completa,
    });

    await this.marketAnimalRepo.save(publicacion);

    if (
      imagenesEliminar &&
      Array.isArray(imagenesEliminar) &&
      imagenesEliminar.length > 0
    ) {
      const imagenes = await this.marketImagesAnimales.find({
        where: {
          id: In(imagenesEliminar),
          animal: {
            id: publicacion.id,
          },
        },
      });

      for (const imagen of imagenes) {
        const filePath = path.join(
          __dirname,
          '..',
          '..',
          'uploads',
          'fotos_animales_market',
          imagen.key,
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await this.marketImagesAnimales.remove(imagenes);
    }

    if (files?.length) {
      const uploadDir = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'fotos_animales_market',
      );

      const baseUrl = process.env.APP_URL;

      const nuevasImagenes: MarketplaceAnimalesImage[] = [];

      for (const file of files) {
        const fileExt = path.extname(file.originalname);

        const fileName = `${uuidv4()}${fileExt}`;

        const filePath = path.join(uploadDir, fileName);

        await fs.promises.writeFile(filePath, file.buffer);

        const fileUrl = `${baseUrl}/uploads/fotos_animales_market/${fileName}`;

        nuevasImagenes.push(
          this.marketImagesAnimales.create({
            url: fileUrl,
            key: fileName,
            mimeType: file.mimetype,
            animal: publicacion,
          }),
        );
      }

      await this.marketImagesAnimales.save(nuevasImagenes);
    }

    return 'Publicación actualizada exitosamente';
  }

  async markAsSold(id: string) {
    const product = await this.marketAnimalRepo.findOne({
      where: { id },
      relations: ['animal'],
    });

    if (!product) {
      throw new NotFoundException(`Producto no encontrado`);
    }

    if (product.vendido) {
      throw new BadRequestException('El producto ya fue vendido');
    }

    if (product.animal) {
      product.animal.animal_vendido = true;
      await this.animalRepo.save(product.animal);
    }

    product.vendido = true;
    product.disponible = false;

    return await this.marketAnimalRepo.save(product);
  }

  async remove(id: string, cliente: Cliente) {
    const publicacion = await this.marketAnimalRepo.findOne({
      where: { id },
      relations: {
        vendedor: true,
      },
    });

    if (!publicacion) {
      throw new NotFoundException('No se encontró la publicación');
    }

    if (publicacion.vendedor.id !== cliente.id) {
      throw new ForbiddenException('No puedes eliminar esta publicación');
    }

    publicacion.eliminada = true;
    publicacion.disponible = false;

    await this.marketAnimalRepo.save(publicacion);

    return {
      message: 'Publicación eliminada correctamente',
    };
  }

  private mappingMarketAnimales(market: MarketplaceAnimale) {
    return {
      id: market.id,
      nombre: market.nombre,
      descripcion: market.descripcion,
      direccion: market.direccion_completa,
      precio: market.precio,
      precioHora: market.precioPorHora,
      precioDia: market.precioPorDia,
      precioSemana: market.precioPorSemana,
      precioMes: market.precioPorMes,
      deposito: market.requiereDeposito,
      montoDeposito: market.montoDeposito,
      moneda: market.moneda,
      stock: market.stock,
      disponible: market.disponible,
      vendido: market.vendido,
      modelo: market.modelo,
      eliminada: market.eliminada,
      latitud: market.latitud,
      longitud: market.longitud,
      tipo_publicacion: market.tipo_publicacion,

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
            verificado: market.vendedor.verified,
            create: market.vendedor.createdAt,
            tienePaqueteActivo: this.tienePaqueteActivo(market.vendedor),
            paqueteActivo: this.getPaqueteActivoInfo(market.vendedor),
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

  private tienePaqueteActivo(cliente: Cliente): boolean {
    if (!cliente.paquetes || cliente.paquetes.length === 0) {
      return false;
    }

    return cliente.paquetes.some((clientePaquete) => {
      if (!clientePaquete.activo) return false;

      if (clientePaquete.fechaFin) {
        return new Date(clientePaquete.fechaFin) > new Date();
      }

      return true;
    });
  }
  private getPaqueteActivoInfo(cliente: Cliente): any {
    if (!cliente.paquetes || cliente.paquetes.length === 0) {
      return null;
    }

    const paqueteActivo = cliente.paquetes.find((clientePaquete) => {
      if (!clientePaquete.activo) return false;
      if (clientePaquete.fechaFin) {
        return new Date(clientePaquete.fechaFin) > new Date();
      }
      return true;
    });

    if (!paqueteActivo) return null;

    return {
      id: paqueteActivo.id,
      nombre: paqueteActivo.paquete?.nombre,
      fechaInicio: paqueteActivo.fechaInicio,
      fechaFin: paqueteActivo.fechaFin,
      activo: paqueteActivo.activo,
    };
  }
}
