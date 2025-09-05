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
import { DetalleCompraInsumo } from './detalle-compra-insumo.entity';
import { InvLoteInsumo } from './inv-lote-insumo.entity';
import { Pai } from 'src/pais/entities/pai.entity';

export enum TipoPago {
  CONTADO = 'CONTADO',
  CREDITO = 'CREDITO',
}

@Entity('compra_insumos')
export class CompraInsumo {
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
  @OneToMany(() => DetalleCompraInsumo, (detalle) => detalle.compra)
  detalles: DetalleCompraInsumo[];

  @OneToMany(() => InvLoteInsumo, (lote) => lote.compra)
  lotes: InvLoteInsumo[];

  @ManyToOne(() => Pai)
  pais: Pai;

  @Column({ type: 'uuid' })
  paisId: string;

  // Campos de auditoría
  @ManyToOne(() => User, { eager: false })
  created_by: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { eager: false })
  updated_by: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;
}
