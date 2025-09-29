import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSubServicioDto } from './dto/update-sub_servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubServicio, TipoSubServicio } from './entities/sub_servicio.entity';
import { In, Repository } from 'typeorm';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import {
  Categoria,
  TipoCategoria,
} from 'src/categorias/entities/categoria.entity';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';
import { instanceToPlain } from 'class-transformer';
import { TaxesPai } from 'src/taxes_pais/entities/taxes_pai.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { User } from 'src/auth/entities/auth.entity';
import { ServicioInsumo } from 'src/servicio_insumos/entities/servicio_insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class SubServiciosService {
  constructor(
    @InjectRepository(SubServicio)
    private readonly sub_servicio_repo: Repository<SubServicio>,
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(ServiciosPai)
    private readonly serviciosPaiRepo: Repository<ServiciosPai>,
    @InjectRepository(TaxesPai)
    private readonly taxesPaiRepo: Repository<TaxesPai>,
    @InjectRepository(ServicioInsumo)
    private readonly servicioInsumoRepo: Repository<ServicioInsumo>,
    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,
  ) {}
  async createServicio(createServicioDto: CreateServicioDto) {
    const {
      nombre,
      descripcion,
      servicioId,
      isActive = true,
      disponible = true,
      unidad_venta,
      insumos = [],
    } = createServicioDto;

    try {
      const servicio_existe = await this.servicioRepo.findOne({
        where: { id: servicioId, isActive: true },
      });

      if (!servicio_existe) {
        throw new NotFoundException(
          'No se encontró el servicio seleccionado o está inactivo',
        );
      }

      if (insumos.length <= 0) {
        throw new BadRequestException(
          'Se debe ingresar al menos un insumo al servicio',
        );
      }

      if (insumos.length > 0) {
        const insumoIds = insumos.map((insumo) => insumo.insumoId);
        const insumosExistentes = await this.insumoRepo.find({
          where: { id: In(insumoIds) },
        });

        if (insumosExistentes.length !== insumos.length) {
          throw new NotFoundException(
            'Uno o más insumos no existen o están inactivos',
          );
        }
      }

      const servicio = this.sub_servicio_repo.create({
        nombre,
        descripcion,
        isActive,
        disponible,
        tipo: TipoSubServicio.SERVICIO,
        unidad_venta,
        servicio: { id: servicio_existe.id },
      });

      const servicioCreado = await this.sub_servicio_repo.save(servicio);

      if (insumos.length > 0) {
        const servicioInsumos = insumos.map((insumoDto) =>
          this.servicioInsumoRepo.create({
            servicioId: servicioCreado.id,
            insumoId: insumoDto.insumoId,
            cantidad: insumoDto.cantidad,
          }),
        );

        await this.servicioInsumoRepo.save(servicioInsumos);
      }

      return {
        message: 'Servicio Creado Exitosamente',
        servicioId: servicioCreado.id,
      };
    } catch (error) {
      throw error;
    }
  }

  async createProducto(createProductoDto: CreateProductoDto) {
    const dto = {
      ...createProductoDto,
      tipo: TipoSubServicio.PRODUCTO,
    };

    const {
      nombre,
      unidad_venta,
      marcaId,
      proveedorId,
      categoriaId,
      atributos,
      codigo_barra,
      precio,
      costo,
      paisId,
      codigo,
      taxId,
      compra_minima,
      distribucion_minima,
      es_compra_bodega,
      venta_minima,
      contenido,
      tipo_fraccionamiento,
      unidad_fraccionamiento,
    } = dto;

    try {
      if (!paisId) {
        throw new BadRequestException(
          'Los productos deben tener un país asociado para el precio',
        );
      }

      const pais = await this.paisRepo.findOne({
        where: { id: paisId, isActive: true },
      });

      if (!pais) {
        throw new NotFoundException('País no encontrado o inactivo');
      }

      if (!precio || precio <= 0) {
        throw new BadRequestException(
          'Los productos deben tener un precio válido mayor a 0',
        );
      }

      if (!costo || costo <= 0) {
        throw new BadRequestException(
          'Los productos deben tener un costo válido mayor a 0',
        );
      }

      const productoExistente = await this.sub_servicio_repo.findOne({
        where: { codigo },
      });
      if (productoExistente) {
        throw new ConflictException('Ya existe un producto con este código');
      }

      const taxeExistente = await this.taxesPaiRepo.findOne({
        where: { id: taxId },
      });
      if (!taxeExistente) {
        throw new ConflictException('El taxe o impuesto no está disponible');
      }

      const marca = await this.marcaRepo.findOne({
        where: { id: marcaId, is_active: true },
      });
      if (!marca) {
        throw new NotFoundException('Marca no encontrada o inactiva');
      }

      const proveedor = await this.proveedorRepo.findOne({
        where: { id: proveedorId, is_active: true },
      });
      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado o inactivo');
      }

      const categoria = await this.categoriaRepo.findOne({
        where: { id: categoriaId, is_active: true },
      });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada o inactiva');
      }

      const producto = this.sub_servicio_repo.create({
        nombre,
        codigo,
        tipo: TipoSubServicio.PRODUCTO,
        unidad_venta,
        marca,
        proveedor,
        categoria,
        codigo_barra,
        atributos,
        tax: taxeExistente,
        compra_minima,
        es_compra_bodega,
        distribucion_minima,
        venta_minima,
        contenido,
        tipo_fraccionamiento,
        unidad_fraccionamiento,
      });

      const savedProducto = await this.sub_servicio_repo.save(producto);

      const servicioPai = this.serviciosPaiRepo.create({
        subServicio: savedProducto,
        pais,
        precio,
        costo,
        tiempo: null,
        cantidadMin: null,
        cantidadMax: null,
      });

      await this.serviciosPaiRepo.save(servicioPai);

      return 'Producto Creado Exitosamente';
    } catch (error) {
      {
        throw error;
      }
    }
  }

  async findAllProductos(paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      pais = '',
      categoria = '',
      marca = '',
      proveedor = '',
    } = paginationDto;

    try {
      const queryBuilder = this.sub_servicio_repo
        .createQueryBuilder('producto')
        .leftJoinAndSelect('producto.preciosPorPais', 'precio')
        .leftJoinAndSelect('precio.pais', 'pais')
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.proveedor', 'proveedor')
        .leftJoinAndSelect('producto.categoria', 'categoria')
        .leftJoinAndSelect('producto.tax', 'tax')
        .leftJoinAndSelect('producto.imagenes', 'imagenes')
        .where('producto.tipo = :tipo', { tipo: TipoSubServicio.PRODUCTO })
        .orderBy('imagenes.createdAt', 'DESC');

      if (pais && pais.trim() !== '') {
        queryBuilder.andWhere('(pais.id = :paisId )', {
          paisId: pais,
        });
      }

      if (categoria && categoria.trim() !== '') {
        queryBuilder.andWhere(
          '(categoria.id = :categoriaId OR categoria.nombre ILIKE :categoriaNombre)',
          {
            categoriaId: categoria,
            categoriaNombre: `%${categoria}%`,
          },
        );
      }

      if (marca && marca.trim() !== '') {
        queryBuilder.andWhere(
          '(marca.id = :marcaId OR marca.nombre ILIKE :marcaNombre)',
          {
            marcaId: marca,
            marcaNombre: `%${marca}%`,
          },
        );
      }

      if (proveedor && proveedor.trim() !== '') {
        queryBuilder.andWhere(
          '(proveedor.id = :proveedor OR proveedor.nombre_legal ILIKE :proveedorNombre)',
          {
            proveedor: proveedor,
            proveedorNombre: `%${proveedor}%`,
          },
        );
      }

      queryBuilder.take(limit);
      queryBuilder.skip(offset);

      const [productos, total] = await queryBuilder.getManyAndCount();

      if (!productos || productos.length === 0) {
        let errorMessage = 'No se encontraron productos disponibles';
        const filters = [];

        if (pais) filters.push(`país: ${pais}`);
        if (categoria) filters.push(`categoría: ${categoria}`);
        if (marca) filters.push(`marca: ${marca}`);
        if (proveedor) filters.push(`proveedor: ${proveedor}`);

        if (filters.length > 0) {
          errorMessage += ` con los filtros: ${filters.join(', ')}`;
        }

        throw new BadRequestException(errorMessage);
      }

      if (pais && pais.trim() !== '') {
        productos.forEach((producto) => {
          producto.preciosPorPais = producto.preciosPorPais.filter(
            (precio) =>
              precio.pais.id === pais || precio.pais.nombre.includes(pais),
          );
        });
      }

      return {
        productos: instanceToPlain(productos),
        total: total,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllProductosDisponibles(user: User) {
    const paisId = user.pais.id;

    try {
      const productosDisponibles = await this.sub_servicio_repo
        .createQueryBuilder('producto')
        .leftJoinAndSelect(
          'producto.preciosPorPais',
          'precio',
          'precio.paisId = :paisId',
          { paisId },
        )
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.proveedor', 'proveedor')
        .leftJoinAndSelect('producto.categoria', 'categoria')
        .leftJoinAndSelect('producto.tax', 'tax')
        .where('producto.tipo = :tipo', { tipo: TipoSubServicio.PRODUCTO })
        .andWhere('producto.disponible = :disponible', { disponible: true })
        .andWhere('producto.isActive = :isActive', { isActive: true })
        .andWhere('precio.paisId IS NOT NULL')
        .getMany();

      if (!productosDisponibles || productosDisponibles.length === 0) {
        throw new NotFoundException('No se encontraron productos disponibles');
      }

      return { productos: productosDisponibles };
    } catch (error) {
      throw error;
    }
  }

  async findAllProductosDisponiblesClientes(
    cliente: Cliente,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0, tipo_categoria = '' } = paginationDto;
    const paisId = cliente.pais.id;

    try {
      const queryBuilder = this.sub_servicio_repo
        .createQueryBuilder('producto')
        .leftJoinAndSelect(
          'producto.preciosPorPais',
          'precio',
          'precio.paisId = :paisId',
          { paisId },
        )
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.proveedor', 'proveedor')
        .leftJoinAndSelect('producto.categoria', 'categoria')
        .leftJoinAndSelect('producto.tax', 'tax')
        .leftJoinAndSelect('producto.imagenes', 'imagenes')
        .where('producto.tipo = :tipo', { tipo: TipoSubServicio.PRODUCTO })
        .andWhere('producto.disponible = :disponible', { disponible: true })
        .andWhere('producto.isActive = :isActive', { isActive: true })
        .andWhere('precio.paisId IS NOT NULL');

      if (tipo_categoria && tipo_categoria.trim() !== '') {
        queryBuilder.andWhere('categoria.tipo = :tipoCategoria', {
          tipoCategoria: tipo_categoria,
        });
      }

      const [productosDisponibles, total] = await queryBuilder
        .orderBy('imagenes.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      if (!productosDisponibles || productosDisponibles.length === 0) {
        throw new NotFoundException('No se encontraron productos disponibles');
      }

      return {
        total,
        limit,
        offset,
        productos: productosDisponibles,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      throw error;
    }
  }

  async getProductosRelacionados(
    categoriaId: string,
    paginationDto: PaginationDto,
    limit: number = 10,
  ) {
    const { producto, tipo_categoria } = paginationDto;

    return await this.sub_servicio_repo
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.preciosPorPais', 'preciosPorPais')
      .leftJoinAndSelect('producto.imagenes', 'imagenes')
      .leftJoinAndSelect('producto.marca', 'marca')
      .where('producto.categoriaId = :categoriaId', { categoriaId })
      .andWhere('categoria.tipo = :tipoCategoria', {
        tipoCategoria: tipo_categoria,
      })
      .andWhere('producto.id != :productoExcluirId', {
        productoExcluirId: producto,
      })
      .andWhere('producto.tipo = :tipoProducto', {
        tipoProducto: TipoSubServicio.PRODUCTO,
      })
      .andWhere('producto.disponible = :disponible', { disponible: true })
      .andWhere('producto.isActive = :isActive', { isActive: true })
      .orderBy('producto.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findAll(servicioId: string) {
    try {
      const sub_servicios = await this.sub_servicio_repo
        .createQueryBuilder('sub_servicio')
        .where('sub_servicio.servicioId = :servicioId', { servicioId })
        .leftJoinAndSelect('sub_servicio.servicio', 'servicio')
        .leftJoinAndSelect('sub_servicio.preciosPorPais', 'preciosPorPais')
        .leftJoinAndSelect('preciosPorPais.pais', 'pais')
        .leftJoinAndSelect('sub_servicio.marca', 'marca')
        .leftJoinAndSelect('sub_servicio.proveedor', 'proveedor')
        .leftJoinAndSelect('sub_servicio.categoria', 'categoria')
        .leftJoinAndSelect('sub_servicio.insumos', 'insumos')
        .orderBy('sub_servicio.createdAt', 'DESC')
        .getMany();

      if (!sub_servicios || sub_servicios.length === 0) {
        throw new BadRequestException(
          'No se encontraron servicios disponibles',
        );
      }

      return sub_servicios;
    } catch (error) {
      throw error;
    }
  }

  async findAllPreciosCantidadAnimales(
    servicioId: string,
    paisId: string,
    cantidadAnimales?: number,
  ) {
    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });
    if (!pais) {
      throw new NotFoundException('No se encontró el país seleccionado');
    }

    const subServicio = await this.sub_servicio_repo.findOne({
      where: { id: servicioId },
      relations: ['preciosPorPais', 'preciosPorPais.pais'],
    });

    if (!subServicio) {
      throw new NotFoundException('No se encontró el servicio seleccionado');
    }

    subServicio.preciosPorPais = subServicio.preciosPorPais.filter(
      (precio) => precio.pais.id === paisId,
    );

    if (subServicio.preciosPorPais.length === 0) {
      throw new BadRequestException(
        'No se encontraron precios configurados para este servicio en el país seleccionado',
      );
    }

    if (cantidadAnimales !== undefined) {
      subServicio.preciosPorPais = subServicio.preciosPorPais.filter(
        (precio) => {
          const min = precio.cantidadMin ?? 0;
          const max = precio.cantidadMax ?? Infinity;
          return cantidadAnimales >= min && cantidadAnimales <= max;
        },
      );

      if (subServicio.preciosPorPais.length === 0) {
        throw new BadRequestException(
          'No se encontraron precios para la cantidad de animales especificada',
        );
      }
    }

    if (cantidadAnimales !== undefined) {
      return subServicio;
    }

    return subServicio;
  }

  async productoById(productoId: string) {
    try {
      const producto = await this.sub_servicio_repo
        .createQueryBuilder('producto')
        .leftJoinAndSelect('producto.preciosPorPais', 'precio')
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.proveedor', 'proveedor')
        .leftJoinAndSelect('producto.categoria', 'categoria')
        .leftJoinAndSelect('producto.tax', 'tax')
        .leftJoinAndSelect('producto.imagenes', 'imagenes')
        .where('producto.id = :productoId', { productoId })
        .andWhere('producto.tipo = :tipo', { tipo: TipoSubServicio.PRODUCTO })
        .orderBy('imagenes.createdAt', 'DESC')
        .getOne();

      if (!producto) {
        throw new NotFoundException('No se encontró el producto seleccionado');
      }

      if (!producto.preciosPorPais || producto.preciosPorPais.length === 0) {
        throw new BadRequestException(
          'El producto no tiene precios configurados',
        );
      }

      return { producto };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el producto');
    }
  }

  async findOne(id: string) {
    try {
      const sub_servicio = await this.sub_servicio_repo.findOne({
        where: {
          id,
        },
      });
      if (!sub_servicio) {
        throw new NotFoundException(
          'No se encontro el subservicio seleccionado',
        );
      }
      return sub_servicio;
    } catch (error) {
      throw error;
    }
  }

  async updateServicio(id: string, updateServicioDto: UpdateServicioDto) {
    const {
      nombre,
      descripcion,
      isActive,
      servicioId,
      disponible,
      unidad_venta,
      insumos = [],
    } = updateServicioDto;

    try {
      const servicio = await this.sub_servicio_repo.findOne({
        where: { id },
        relations: ['insumos'],
      });

      if (!servicio) {
        throw new NotFoundException(
          'No se encontró el servicio que desea actualizar',
        );
      }

      if (
        updateServicioDto.tipo &&
        updateServicioDto.tipo !== TipoSubServicio.SERVICIO
      ) {
        throw new BadRequestException(
          'No se puede cambiar un servicio a producto. Cree un nuevo producto en su lugar.',
        );
      }

      if (isActive === false && disponible === true) {
        throw new BadRequestException(
          'No se puede tener un servicio inactivo pero disponible',
        );
      }

      if (nombre !== undefined) servicio.nombre = nombre;
      if (descripcion !== undefined) servicio.descripcion = descripcion;
      if (isActive !== undefined) servicio.isActive = isActive;
      if (disponible !== undefined) servicio.disponible = disponible;
      if (unidad_venta !== undefined) servicio.unidad_venta = unidad_venta;

      if (servicioId) {
        const servicioPadre = await this.servicioRepo.findOne({
          where: { id: servicioId, isActive: true },
        });
        if (!servicioPadre) {
          throw new NotFoundException(
            'Servicio padre no encontrado o inactivo',
          );
        }
        servicio.servicio = servicioPadre;
      }

      const servicioActualizado = await this.sub_servicio_repo.save(servicio);

      if (insumos.length > 0) {
        const insumoIds = insumos.map((i) => i.insumoId);
        const insumosExistentes = await this.insumoRepo.find({
          where: { id: In(insumoIds) },
        });

        if (insumosExistentes.length !== insumos.length) {
          throw new NotFoundException(
            'Uno o más insumos no existen o están inactivos',
          );
        }

        await this.servicioInsumoRepo.delete({ servicioId: servicio.id });

        const nuevosInsumos = insumos.map((insumoDto) =>
          this.servicioInsumoRepo.create({
            servicioId: servicio.id,
            insumoId: insumoDto.insumoId,
            cantidad: insumoDto.cantidad,
          }),
        );

        await this.servicioInsumoRepo.save(nuevosInsumos);
      }

      const servicioCompleto = await this.sub_servicio_repo.findOne({
        where: { id: servicioActualizado.id },
        relations: ['insumos', 'insumos.insumo'],
      });

      return {
        message: 'Servicio actualizado correctamente',
        data: servicioCompleto,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno del servidor al actualizar el servicio',
      );
    }
  }

  async updateProducto(id: string, updateProductoDto: UpdateProductoDto) {
    const {
      nombre,
      isActive,
      disponible,
      unidad_venta,
      atributos,
      categoriaId,
      codigo_barra,
      costo,
      marcaId,
      paisId,
      precio,
      proveedorId,
      taxId,
      codigo,
      compra_minima,
      distribucion_minima,
      es_compra_bodega,
      venta_minima,
      contenido,
      tipo_fraccionamiento,
      unidad_fraccionamiento,
    } = updateProductoDto;

    try {
      const producto = await this.sub_servicio_repo.findOne({
        where: { id, tipo: TipoSubServicio.PRODUCTO },
      });

      if (!producto) {
        throw new NotFoundException(
          'No se encontró el producto que desea actualizar',
        );
      }

      if (
        updateProductoDto.tipo &&
        updateProductoDto.tipo !== TipoSubServicio.PRODUCTO
      ) {
        throw new BadRequestException(
          'No se puede cambiar un producto a servicio. Cree un nuevo servicio en su lugar.',
        );
      }

      if (isActive === false && disponible === true) {
        throw new BadRequestException(
          'No se puede tener un producto inactivo pero disponible',
        );
      }

      if (nombre !== undefined) producto.nombre = nombre;

      if (isActive !== undefined) producto.isActive = isActive;
      if (disponible !== undefined) producto.disponible = disponible;
      if (unidad_venta !== undefined) producto.unidad_venta = unidad_venta;
      if (codigo !== undefined) producto.codigo = codigo;
      if (codigo_barra !== undefined) producto.codigo_barra = codigo_barra;
      if (atributos !== undefined) producto.atributos = atributos;
      if (compra_minima !== undefined) producto.compra_minima = compra_minima;
      if (distribucion_minima !== undefined)
        producto.distribucion_minima = distribucion_minima;
      if (es_compra_bodega !== undefined)
        producto.es_compra_bodega = es_compra_bodega;
      if (venta_minima !== undefined) producto.venta_minima = venta_minima;
      if (contenido !== undefined) producto.contenido = contenido;
      if (tipo_fraccionamiento !== undefined)
        producto.tipo_fraccionamiento = tipo_fraccionamiento;
      if (unidad_fraccionamiento !== undefined)
        producto.unidad_fraccionamiento = unidad_fraccionamiento;

      if (marcaId) {
        const marca = await this.marcaRepo.findOne({
          where: { id: marcaId, is_active: true },
        });
        if (!marca)
          throw new NotFoundException('Marca no encontrada o inactiva');
        producto.marca = marca;
      }

      if (proveedorId) {
        const proveedor = await this.proveedorRepo.findOne({
          where: { id: proveedorId, is_active: true },
        });
        if (!proveedor)
          throw new NotFoundException('Proveedor no encontrado o inactivo');
        producto.proveedor = proveedor;
      }

      if (categoriaId) {
        const categoria = await this.categoriaRepo.findOne({
          where: { id: categoriaId, is_active: true },
        });
        if (!categoria)
          throw new NotFoundException('Categoría no encontrada o inactiva');
        producto.categoria = categoria;
      }

      if (taxId) {
        const tax = await this.taxesPaiRepo.findOne({
          where: { id: taxId },
        });
        if (!tax) throw new NotFoundException('Tax o impuesto no encontrado');
        producto.tax = tax;
      }

      if (paisId && (precio !== undefined || costo !== undefined)) {
        const pais = await this.paisRepo.findOne({
          where: { id: paisId, isActive: true },
        });
        if (!pais) throw new NotFoundException('País no encontrado o inactivo');

        let precioPais = await this.serviciosPaiRepo.findOne({
          where: {
            subServicio: { id: producto.id },
            pais: { id: paisId },
          },
        });

        if (!precioPais) {
          precioPais = this.serviciosPaiRepo.create({
            subServicio: producto,
            pais,
            precio: precio || 0,
            costo: costo || 0,
            tiempo: null,
            cantidadMin: null,
            cantidadMax: null,
          });
        } else {
          if (precio !== undefined) precioPais.precio = precio;
          if (costo !== undefined) precioPais.costo = costo;
        }

        await this.serviciosPaiRepo.save(precioPais);
      }

      await this.sub_servicio_repo.save(producto);

      return 'Producto actualizado correctamente';
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno del servidor al actualizar el producto',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} subServicio`;
  }
}
