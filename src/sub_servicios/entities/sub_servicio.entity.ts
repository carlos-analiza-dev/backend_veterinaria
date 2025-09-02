import { Medico } from 'src/medicos/entities/medico.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';
import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CitaProducto } from 'src/cita_productos/entities/cita_producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { ServicioInsumo } from 'src/servicio_insumos/entities/servicio_insumo.entity';
import { TaxesPai } from 'src/taxes_pais/entities/taxes_pai.entity';
import { ProductosImage } from 'src/productos_images/entities/productos_image.entity';

export enum UnidadVenta {
  UNIDAD = 'unidad',
  KILOGRAMO = 'kilogramo',
  LIBRA = 'libra',
  GALON = 'galon',
  METRO = 'metro',
  PIE = 'pie',
  M2 = 'm2',
}

export enum TipoSubServicio {
  PRODUCTO = 'producto',
  SERVICIO = 'servicio',
}

@Entity('sub_servicios')
export class SubServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, default: 'N/D' })
  codigo: string;

  @Column({ length: 20, default: 'N/D' })
  codigo_barra?: string;

  @Column({ length: 250, default: 'N/D' })
  atributos?: string;

  @Column({
    type: 'enum',
    enum: TipoSubServicio,
    default: TipoSubServicio.SERVICIO,
  })
  tipo: TipoSubServicio;

  @Column({
    type: 'enum',
    enum: UnidadVenta,
    default: UnidadVenta.UNIDAD,
  })
  unidad_venta: UnidadVenta;

  @Column({ type: 'text', default: 'N/D' })
  descripcion: string | null;

  @Column({ name: 'servicio_id', nullable: true })
  servicioId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ default: true })
  disponible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Marca, (marca) => marca.productos, {
    nullable: true,
  })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca | null;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
    nullable: true,
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor | null;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria | null;

  @OneToMany(
    () => ServicioInsumo,
    (servicioInsumo) => servicioInsumo.servicio,
    {
      cascade: true,

      nullable: true,
    },
  )
  insumos: ServicioInsumo[];

  @Column({ name: 'categoria_id', nullable: true })
  categoriaId: string | null;

  @ManyToOne(() => Servicio, (servicio) => servicio.subServicios, {
    nullable: true,
  })
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @OneToMany(() => ServiciosPai, (precio) => precio.subServicio, {
    cascade: true,
  })
  preciosPorPais: ServiciosPai[];

  @ManyToMany(() => Medico, (medico) => medico.areas_trabajo)
  medicos: Medico[];

  @OneToOne(() => InventarioProducto, (inventario) => inventario.producto, {
    nullable: true,
  })
  inventario?: InventarioProducto;

  @OneToMany(() => CitaProducto, (citaProducto) => citaProducto.producto)
  citas: CitaProducto[];

  @ManyToOne(() => TaxesPai, { nullable: true })
  @JoinColumn({ name: 'taxId' })
  tax: TaxesPai;

  @OneToMany(() => ProductosImage, (producto) => producto.producto, {
    eager: false,
  })
  imagenes: ProductosImage[];
}
