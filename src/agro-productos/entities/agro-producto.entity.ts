import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { UnidadVenta } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { TaxesPai } from 'src/taxes_pais/entities/taxes_pai.entity';
import { TipoProducto } from 'src/tipo_producto/entities/tipo_producto.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImagesAgroProductos } from './images-agro-productos.entity';

@Entity('agro-productos')
export class AgroProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @Column({
    type: 'enum',
    enum: UnidadVenta,
    nullable: true,
  })
  unidad_venta?: UnidadVenta;

  @Column({
    type: 'enum',
    enum: UnidadVenta,
    nullable: true,
  })
  tipo_fraccionamiento?: UnidadVenta;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({
    default: true,
  })
  disponible: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  codigo_barra?: string;

  @Column({
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  atributos?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  precio: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  costo: number;

  @Column({
    default: false,
  })
  es_compra_bodega: boolean;

  @Column({
    type: 'int',
    nullable: true,
  })
  compra_minima?: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  distribucion_minima?: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  venta_minima?: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  unidad_fraccionamiento?: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  contenido?: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  componentes?: {
    nombre: string;
    cantidad?: string;
    unidad?: string;
  }[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  tipos_uso?: string[];

  @Column({
    type: 'text',
    nullable: true,
  })
  forma_uso?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  indicaciones?: string[];

  /* Relaciones */

  @ManyToOne(() => Marca, {
    nullable: true,
  })
  @JoinColumn()
  marca?: Marca;

  @ManyToOne(() => AgroProveedore)
  @JoinColumn()
  proveedor: AgroProveedore;

  @ManyToOne(() => Categoria)
  @JoinColumn()
  categoria: Categoria;

  @ManyToOne(() => Subcategoria)
  @JoinColumn()
  subcategoria: Subcategoria;

  @ManyToOne(() => TipoProducto)
  @JoinColumn()
  tipo_producto: TipoProducto;

  @ManyToOne(() => TaxesPai, {
    nullable: true,
  })
  @JoinColumn()
  tax?: TaxesPai;

  @ManyToOne(() => Pai)
  @JoinColumn()
  pais: Pai;

  @ManyToOne(() => DatosAgroservicio)
  @JoinColumn()
  agroservicio: DatosAgroservicio;

  @OneToMany(() => ImagesAgroProductos, (image) => image.producto, {
    eager: true,
  })
  images: ImagesAgroProductos[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
