import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LoteAgroProducto } from './lote-agro-compra.entity';
import { CompraDetalleAgroProducto } from './compra-detalle-agro-producto.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';

export enum TipoPago {
  CONTADO = 'CONTADO',
  CREDITO = 'CREDITO',
}

export enum TipoCompra {
  PRODUCTO = 'PRODUCTO',
  INSUMO = 'INSUMO',
  SERVICIO = 'SERVICIO',
}

@Entity('agro-compras-productos')
export class AgroComprasProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroProveedore, { eager: false })
  proveedor: AgroProveedore;

  @Column({ type: 'uuid' })
  proveedorId: string;

  @ManyToOne(() => AgroSucursale, { eager: false })
  sucursal: AgroSucursale;

  @Column({ type: 'uuid' })
  sucursalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  numero_factura: string;

  @Column({
    type: 'enum',
    enum: TipoPago,
    default: TipoPago.CONTADO,
  })
  tipo_pago: TipoPago;

  @Column({
    type: 'enum',
    enum: TipoCompra,
    default: TipoCompra.PRODUCTO,
  })
  tipo_compra: TipoCompra;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuentos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn()
  fecha: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => CompraDetalleAgroProducto, (detalle) => detalle.compra)
  detalles: CompraDetalleAgroProducto[];

  @OneToMany(() => LoteAgroProducto, (lote) => lote.compra)
  lotes: LoteAgroProducto[];

  @ManyToOne(() => DatosAgroservicio)
  agroservicio: DatosAgroservicio;

  @Column({ type: 'uuid', nullable: true })
  agroservicioId: string;
}
