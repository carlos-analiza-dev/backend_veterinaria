// compra.entity.ts - SOLUCIÓN 1
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { User } from 'src/auth/entities/auth.entity';
import { CompraDetalle } from './compra-detalle.entity';
import { Lote } from 'src/lotes/entities/lote.entity';

export enum TipoPago {
  CONTADO = 'CONTADO',
  CREDITO = 'CREDITO',
}

export enum TipoCompra {
  PRODUCTO = 'PRODUCTO',
  INSUMO = 'INSUMO',
  SERVICIO = 'SERVICIO',
}

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Proveedor, { eager: false })
  proveedor: Proveedor;

  @Column({ type: 'uuid' })
  proveedorId: string;

  @ManyToOne(() => Sucursal, { eager: false })
  sucursal: Sucursal;

  @Column({ type: 'uuid' })
  sucursalId: string;

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

  // Relaciones
  @OneToMany(() => CompraDetalle, (detalle) => detalle.compra)
  detalles: CompraDetalle[];

  @OneToMany(() => Lote, (lote) => lote.compra)
  lotes: Lote[];

  // Campos de auditoría
  @ManyToOne(() => User)
  created_by: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  updated_by: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;
}
