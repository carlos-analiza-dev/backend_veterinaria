import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgroProductoDto } from './dto/create-agro-producto.dto';
import { UpdateAgroProductoDto } from './dto/update-agro-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { TaxesPai } from 'src/taxes_pais/entities/taxes_pai.entity';
import { TipoProducto } from 'src/tipo_producto/entities/tipo_producto.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { AgroProducto } from './entities/agro-producto.entity';
import {
  AccionProducto,
  AuditoriaProducto,
} from './entities/auditoria-productos.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { ImagesAgroProductos } from './entities/images-agro-productos.entity';
import { CreateEscalasAgroProductoDto } from './dto/create-escala-agro-producto.dto';
import { EscalasProductoAgro } from './entities/escalas-agro-producto.entity';

@Injectable()
export class AgroProductosService {
  constructor(
    @InjectRepository(AgroProducto)
    private readonly productoRepo: Repository<AgroProducto>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(AgroProveedore)
    private readonly proveedorRepo: Repository<AgroProveedore>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(TaxesPai)
    private readonly taxesPaiRepo: Repository<TaxesPai>,
    @InjectRepository(TipoProducto)
    private readonly tipoProductoRepo: Repository<TipoProducto>,
    @InjectRepository(Subcategoria)
    private readonly subCategoriaRepo: Repository<Subcategoria>,
    @InjectRepository(AuditoriaProducto)
    private readonly auditRepo: Repository<AuditoriaProducto>,
    @InjectRepository(ImagesAgroProductos)
    private readonly imagesRepo: Repository<ImagesAgroProductos>,
    @InjectRepository(EscalasProductoAgro)
    private readonly escalasRepo: Repository<EscalasProductoAgro>,
    private readonly validationAgroService: AgroservicioValidationService,
  ) {}
  async create(cliente: Cliente, createDto: CreateAgroProductoDto) {
    const propietarioId = cliente.id;
    const paisId = cliente.pais.id ?? '';

    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);

    const {
      marcaId,
      proveedorId,
      categoriaId,
      subcategoriaId,
      tipo_producto_id,
      taxId,
      codigo_barra,
      ...rest
    } = createDto;

    const existeCodigo = await this.productoRepo.findOne({
      where: {
        codigo_barra,
        agroservicio: {
          id: agroservicio.id,
        },
      },
    });

    if (existeCodigo) {
      throw new ConflictException(
        `Ya existe un producto con el código ${codigo_barra}.`,
      );
    }

    const pais = await this.paisRepo.findOneBy({
      id: paisId,
    });

    if (!pais) {
      throw new NotFoundException('País no encontrado.');
    }

    let marca: Marca | null = null;

    if (marcaId) {
      marca = await this.marcaRepo.findOneBy({
        id: marcaId,
      });

      if (!marca) {
        throw new NotFoundException('Marca no encontrada.');
      }
    }

    const proveedor = await this.proveedorRepo.findOne({
      where: {
        id: proveedorId,
        agroservicio: {
          id: agroservicio.id,
        },
      },
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado.');
    }

    const categoria = await this.categoriaRepo.findOneBy({
      id: categoriaId,
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    const subcategoria = await this.subCategoriaRepo.findOne({
      where: {
        id: subcategoriaId,
        categoria: {
          id: categoria.id,
        },
      },
    });

    if (!subcategoria) {
      throw new NotFoundException(
        'La subcategoría no pertenece a la categoría seleccionada.',
      );
    }

    const tipoProducto = await this.tipoProductoRepo.findOneBy({
      id: tipo_producto_id,
    });

    if (!tipoProducto) {
      throw new NotFoundException('Tipo de producto no encontrado.');
    }

    let tax: TaxesPai | null = null;

    if (taxId) {
      tax = await this.taxesPaiRepo.findOneBy({
        id: taxId,
      });

      if (!tax) {
        throw new NotFoundException('Impuesto no encontrado.');
      }
    }

    const codigo = await this.generarCodigoProducto(
      createDto.categoriaId,
      createDto.tipo_producto_id,
    );

    const producto = this.productoRepo.create({
      ...rest,
      codigo_barra,
      agroservicio,
      pais,
      proveedor,
      categoria,
      subcategoria,
      tipo_producto: tipoProducto,
      marca,
      tax,
      codigo,
    });

    await this.productoRepo.save(producto);

    return 'Producto Creado Exitosamente';
  }

  async createAgroEmpleado(
    createDto: CreateAgroProductoDto,
    empleado: EmpleadosAgro,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const paisId = empleado.pais.id ?? '';
    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);

    const {
      marcaId,
      proveedorId,
      categoriaId,
      subcategoriaId,
      tipo_producto_id,
      taxId,
      codigo_barra,
      ...rest
    } = createDto;

    const existeCodigo = await this.productoRepo.findOne({
      where: {
        codigo_barra,
        agroservicio: {
          id: agroservicio.id,
        },
      },
    });

    if (existeCodigo) {
      throw new ConflictException(
        `Ya existe un producto con el código ${codigo_barra}.`,
      );
    }

    const pais = await this.paisRepo.findOneBy({
      id: paisId,
    });

    if (!pais) {
      throw new NotFoundException('País no encontrado.');
    }

    let marca: Marca | null = null;

    if (marcaId) {
      marca = await this.marcaRepo.findOneBy({
        id: marcaId,
      });

      if (!marca) {
        throw new NotFoundException('Marca no encontrada.');
      }
    }

    const proveedor = await this.proveedorRepo.findOne({
      where: {
        id: proveedorId,
        agroservicio: {
          id: agroservicio.id,
        },
      },
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado.');
    }

    const categoria = await this.categoriaRepo.findOneBy({
      id: categoriaId,
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    const subcategoria = await this.subCategoriaRepo.findOne({
      where: {
        id: subcategoriaId,
        categoria: {
          id: categoria.id,
        },
      },
    });

    if (!subcategoria) {
      throw new NotFoundException(
        'La subcategoría no pertenece a la categoría seleccionada.',
      );
    }

    const tipoProducto = await this.tipoProductoRepo.findOneBy({
      id: tipo_producto_id,
    });

    if (!tipoProducto) {
      throw new NotFoundException('Tipo de producto no encontrado.');
    }

    let tax: TaxesPai | null = null;

    if (taxId) {
      tax = await this.taxesPaiRepo.findOneBy({
        id: taxId,
      });

      if (!tax) {
        throw new NotFoundException('Impuesto no encontrado.');
      }
    }

    const codigo = await this.generarCodigoProducto(
      createDto.categoriaId,
      createDto.tipo_producto_id,
    );

    const producto = this.productoRepo.create({
      ...rest,
      codigo_barra,
      agroservicio,
      pais,
      proveedor,
      categoria,
      subcategoria,
      tipo_producto: tipoProducto,
      marca,
      tax,
      codigo,
    });

    await this.productoRepo.save(producto);

    await this.auditRepo.save({
      productoId: producto.id,
      empleadoId: empleado.id,
      accion: AccionProducto.CREAR,
    });

    return 'Producto Creado Exitosamente';
  }

  async createEscala(
    createEscalasAgroProductoDto: CreateEscalasAgroProductoDto,
  ) {
    const {
      cantidad_comprada,
      costo,
      bonificacion,
      productoId,
      proveedorId,
      paisId,
      isActive,
    } = createEscalasAgroProductoDto;
    try {
      const producto_existe = await this.productoRepo.findOne({
        where: { id: productoId },
      });
      if (!producto_existe)
        throw new NotFoundException('No se encontro el producto seleccionado');

      const proveedor_existe = await this.proveedorRepo.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_existe)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const pais_existe = await this.paisRepo.findOne({
        where: { id: paisId },
      });
      if (!pais_existe)
        throw new NotFoundException('No se encontro el pais seleccionado');

      const escala = this.escalasRepo.create({
        cantidad_comprada,
        bonificacion,
        costo,
        isActive,
        producto: producto_existe,
        pais: pais_existe,
        proveedor: proveedor_existe,
      });
      await this.escalasRepo.save(escala);
      return 'Escala del producto creada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async uploadImagesProducto(
    productoId: string,
    imagenes: Express.Multer.File[],
  ): Promise<ImagesAgroProductos[]> {
    const producto = await this.productoRepo.findOne({
      where: {
        id: productoId,
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado.');
    }

    if (!imagenes || imagenes.length === 0) {
      return [];
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'agro-productos',
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseUrl = process.env.APP_URL;

    const imagenesGuardadas: ImagesAgroProductos[] = [];

    for (const imagen of imagenes) {
      const extension = path.extname(imagen.originalname);
      const nombreArchivo = `${uuidv4()}${extension}`;
      const rutaArchivo = path.join(uploadDir, nombreArchivo);

      await fs.promises.writeFile(rutaArchivo, imagen.buffer);

      const url = `${baseUrl}/uploads/agro-productos/${nombreArchivo}`;

      const image = this.imagesRepo.create({
        url,
        key: nombreArchivo,
        mimeType: imagen.mimetype,
        producto,
      });

      const savedImage = await this.imagesRepo.save(image);

      imagenesGuardadas.push(savedImage);
    }

    return imagenesGuardadas;
  }

  async findAll(
    propietarioId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    productos: AgroProducto[];
    total: number;
  }> {
    const {
      limit = 10,
      offset = 0,
      categoria = '',
      marca = '',
      proveedor = '',
    } = paginationDto;

    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);

    const query = this.productoRepo
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.images', 'images')
      .leftJoinAndSelect('producto.pais', 'pais')
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('producto.proveedor', 'proveedor')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.subcategoria', 'subcategoria')
      .leftJoinAndSelect('producto.tipo_producto', 'tipoProducto')
      .leftJoinAndSelect('producto.tax', 'tax')
      .where('producto.agroservicioId = :agroservicioId', {
        agroservicioId: agroservicio.id,
      });

    if (categoria) {
      query.andWhere('categoria.id = :categoriaId', {
        categoriaId: categoria,
      });
    }

    if (marca) {
      query.andWhere('marca.id = :marcaId', {
        marcaId: marca,
      });
    }

    if (proveedor) {
      query.andWhere('proveedor.id = :proveedorId', {
        proveedorId: proveedor,
      });
    }

    query.orderBy('producto.createdAt', 'DESC').take(limit).skip(offset);

    const [productos, total] = await query.getManyAndCount();

    return {
      productos,
      total,
    };
  }

  async findTodos(propietarioId: string): Promise<AgroProducto[]> {
    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);

    return await this.productoRepo
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.images', 'images')
      .leftJoinAndSelect('producto.pais', 'pais')
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('producto.proveedor', 'proveedor')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.subcategoria', 'subcategoria')
      .leftJoinAndSelect('producto.tipo_producto', 'tipoProducto')
      .leftJoinAndSelect('producto.tax', 'tax')
      .where('producto.agroservicioId = :agroservicioId', {
        agroservicioId: agroservicio.id,
      })
      .orderBy('producto.nombre', 'ASC')
      .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} agroProducto`;
  }

  async update(id: string, updateDto: UpdateAgroProductoDto, cliente: Cliente) {
    const propietarioId = cliente.id;
    const paisId = cliente.pais.id ?? '';

    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);

    const producto = await this.productoRepo.findOne({
      where: {
        id,
        agroservicio: {
          id: agroservicio.id,
        },
      },
      relations: [
        'marca',
        'proveedor',
        'categoria',
        'subcategoria',
        'tipo_producto',
        'tax',
        'pais',
      ],
    });

    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado o no pertenece a este agroservicio.',
      );
    }

    const {
      marcaId,
      proveedorId,
      categoriaId,
      subcategoriaId,
      tipo_producto_id,
      taxId,
      codigo_barra,
      ...rest
    } = updateDto;

    if (codigo_barra && codigo_barra !== producto.codigo_barra) {
      const existeCodigo = await this.productoRepo.findOne({
        where: {
          codigo_barra,
          agroservicio: {
            id: agroservicio.id,
          },
        },
      });

      if (existeCodigo) {
        throw new ConflictException(
          `Ya existe un producto con el código ${codigo_barra}.`,
        );
      }
    }

    const pais = await this.paisRepo.findOneBy({
      id: paisId,
    });

    if (!pais) {
      throw new NotFoundException('País no encontrado.');
    }

    let marca: Marca | null = producto.marca;
    if (marcaId !== undefined) {
      if (marcaId === null) {
        marca = null;
      } else {
        const marcaFound = await this.marcaRepo.findOneBy({
          id: marcaId,
        });
        if (!marcaFound) {
          throw new NotFoundException('Marca no encontrada.');
        }
        marca = marcaFound;
      }
    }

    let proveedor = producto.proveedor;
    if (proveedorId !== undefined) {
      if (proveedorId === null) {
        proveedor = null;
      } else {
        const proveedorFound = await this.proveedorRepo.findOne({
          where: {
            id: proveedorId,
            agroservicio: {
              id: agroservicio.id,
            },
          },
        });
        if (!proveedorFound) {
          throw new NotFoundException('Proveedor no encontrado.');
        }
        proveedor = proveedorFound;
      }
    }

    let categoria = producto.categoria;
    let subcategoria = producto.subcategoria;
    if (categoriaId !== undefined) {
      if (categoriaId === null) {
        categoria = null;
        subcategoria = null;
      } else {
        const categoriaFound = await this.categoriaRepo.findOneBy({
          id: categoriaId,
        });
        if (!categoriaFound) {
          throw new NotFoundException('Categoría no encontrada.');
        }
        categoria = categoriaFound;

        subcategoria = null;
      }
    }

    if (subcategoriaId !== undefined) {
      if (subcategoriaId === null) {
        subcategoria = null;
      } else if (categoria) {
        const subcategoriaFound = await this.subCategoriaRepo.findOne({
          where: {
            id: subcategoriaId,
            categoria: {
              id: categoria.id,
            },
          },
        });
        if (!subcategoriaFound) {
          throw new NotFoundException(
            'La subcategoría no pertenece a la categoría seleccionada.',
          );
        }
        subcategoria = subcategoriaFound;
      } else {
        throw new BadRequestException(
          'Debe seleccionar una categoría antes de seleccionar una subcategoría.',
        );
      }
    }

    let tipoProducto = producto.tipo_producto;
    if (tipo_producto_id !== undefined) {
      if (tipo_producto_id === null) {
        tipoProducto = null;
      } else {
        const tipoFound = await this.tipoProductoRepo.findOneBy({
          id: tipo_producto_id,
        });
        if (!tipoFound) {
          throw new NotFoundException('Tipo de producto no encontrado.');
        }
        tipoProducto = tipoFound;
      }
    }

    let tax: TaxesPai | null = producto.tax;
    if (taxId !== undefined) {
      if (taxId === null) {
        tax = null;
      } else {
        const taxFound = await this.taxesPaiRepo.findOneBy({
          id: taxId,
        });
        if (!taxFound) {
          throw new NotFoundException('Impuesto no encontrado.');
        }
        tax = taxFound;
      }
    }

    const categoriaCambio = categoria?.id !== producto.categoria?.id;

    const tipoCambio = tipoProducto?.id !== producto.tipo_producto?.id;

    let codigo = producto.codigo;

    if (categoriaCambio || tipoCambio) {
      codigo = await this.generarCodigoProducto(categoria.id, tipoProducto.id);
    }

    Object.assign(producto, {
      ...rest,
      codigo,
      codigo_barra: codigo_barra || producto.codigo_barra,
      pais,
      marca,
      proveedor,
      categoria,
      subcategoria,
      tipo_producto: tipoProducto,
      tax,
      updated_at: new Date(),
    });

    await this.productoRepo.save(producto);

    return 'Producto actualizado exitosamente';
  }

  async updateEmpleado(
    id: string,
    updateDto: UpdateAgroProductoDto,
    empleado: EmpleadosAgro,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const paisId = empleado.pais.id ?? '';

    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);

    const producto = await this.productoRepo.findOne({
      where: {
        id,
        agroservicio: {
          id: agroservicio.id,
        },
      },
      relations: [
        'marca',
        'proveedor',
        'categoria',
        'subcategoria',
        'tipo_producto',
        'tax',
        'pais',
      ],
    });

    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado o no pertenece a este agroservicio.',
      );
    }

    const {
      marcaId,
      proveedorId,
      categoriaId,
      subcategoriaId,
      tipo_producto_id,
      taxId,
      codigo_barra,
      ...rest
    } = updateDto;

    if (codigo_barra && codigo_barra !== producto.codigo_barra) {
      const existeCodigo = await this.productoRepo.findOne({
        where: {
          codigo_barra,
          agroservicio: {
            id: agroservicio.id,
          },
        },
      });

      if (existeCodigo) {
        throw new ConflictException(
          `Ya existe un producto con el código ${codigo_barra}.`,
        );
      }
    }

    const pais = await this.paisRepo.findOneBy({
      id: paisId,
    });

    if (!pais) {
      throw new NotFoundException('País no encontrado.');
    }

    let marca: Marca | null = producto.marca;
    if (marcaId !== undefined) {
      if (marcaId === null) {
        marca = null;
      } else {
        const marcaFound = await this.marcaRepo.findOneBy({
          id: marcaId,
        });
        if (!marcaFound) {
          throw new NotFoundException('Marca no encontrada.');
        }
        marca = marcaFound;
      }
    }

    let proveedor = producto.proveedor;
    if (proveedorId !== undefined) {
      if (proveedorId === null) {
        proveedor = null;
      } else {
        const proveedorFound = await this.proveedorRepo.findOne({
          where: {
            id: proveedorId,
            agroservicio: {
              id: agroservicio.id,
            },
          },
        });
        if (!proveedorFound) {
          throw new NotFoundException('Proveedor no encontrado.');
        }
        proveedor = proveedorFound;
      }
    }

    let categoria = producto.categoria;
    let subcategoria = producto.subcategoria;
    if (categoriaId !== undefined) {
      if (categoriaId === null) {
        categoria = null;
        subcategoria = null;
      } else {
        const categoriaFound = await this.categoriaRepo.findOneBy({
          id: categoriaId,
        });
        if (!categoriaFound) {
          throw new NotFoundException('Categoría no encontrada.');
        }
        categoria = categoriaFound;
        subcategoria = null;
      }
    }

    if (subcategoriaId !== undefined) {
      if (subcategoriaId === null) {
        subcategoria = null;
      } else if (categoria) {
        const subcategoriaFound = await this.subCategoriaRepo.findOne({
          where: {
            id: subcategoriaId,
            categoria: {
              id: categoria.id,
            },
          },
        });
        if (!subcategoriaFound) {
          throw new NotFoundException(
            'La subcategoría no pertenece a la categoría seleccionada.',
          );
        }
        subcategoria = subcategoriaFound;
      } else {
        throw new BadRequestException(
          'Debe seleccionar una categoría antes de seleccionar una subcategoría.',
        );
      }
    }

    let tipoProducto = producto.tipo_producto;
    if (tipo_producto_id !== undefined) {
      if (tipo_producto_id === null) {
        tipoProducto = null;
      } else {
        const tipoFound = await this.tipoProductoRepo.findOneBy({
          id: tipo_producto_id,
        });
        if (!tipoFound) {
          throw new NotFoundException('Tipo de producto no encontrado.');
        }
        tipoProducto = tipoFound;
      }
    }

    let tax: TaxesPai | null = producto.tax;
    if (taxId !== undefined) {
      if (taxId === null) {
        tax = null;
      } else {
        const taxFound = await this.taxesPaiRepo.findOneBy({
          id: taxId,
        });
        if (!taxFound) {
          throw new NotFoundException('Impuesto no encontrado.');
        }
        tax = taxFound;
      }
    }

    const categoriaCambio = categoria?.id !== producto.categoria?.id;

    const tipoCambio = tipoProducto?.id !== producto.tipo_producto?.id;

    let codigo = producto.codigo;

    if (categoriaCambio || tipoCambio) {
      codigo = await this.generarCodigoProducto(categoria.id, tipoProducto.id);
    }

    Object.assign(producto, {
      ...rest,
      codigo,
      codigo_barra: codigo_barra || producto.codigo_barra,
      pais,
      marca,
      proveedor,
      categoria,
      subcategoria,
      tipo_producto: tipoProducto,
      tax,
      updated_at: new Date(),
    });

    await this.productoRepo.save(producto);

    await this.auditRepo.save({
      productoId: producto.id,
      empleadoId: empleado.id,
      accion: AccionProducto.ACTUALIZAR,
    });

    return 'Producto actualizado exitosamente';
  }

  async deleteImageProducto(imageId: string) {
    const imagen = await this.imagesRepo.findOne({
      where: {
        id: imageId,
      },
    });

    if (!imagen) {
      throw new NotFoundException('La imagen no existe.');
    }

    if (imagen.key) {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'agro-productos',
        imagen.key,
      );

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    await this.imagesRepo.remove(imagen);

    return {
      message: 'Imagen eliminada correctamente.',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} agroProducto`;
  }

  private async generarCodigoProducto(
    categoriaId: string,
    tipoProductoId: string,
  ): Promise<string> {
    const categoria = await this.categoriaRepo.findOne({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const tipoProducto = await this.tipoProductoRepo.findOne({
      where: { id: tipoProductoId },
    });

    if (!tipoProducto) {
      throw new NotFoundException('Tipo de producto no encontrado');
    }

    const categoriaCode = categoria.nombre.trim().substring(0, 3).toUpperCase();

    const tipoCode = tipoProducto.nombre.trim().substring(0, 3).toUpperCase();

    const correlativo =
      (await this.productoRepo.count({
        where: {
          categoria: { id: categoriaId },
          tipo_producto: { id: tipoProductoId },
        },
      })) + 1;

    const correlativoFormat = correlativo.toString().padStart(6, '0');

    return `${categoriaCode}-${tipoCode}-${correlativoFormat}`;
  }
}
