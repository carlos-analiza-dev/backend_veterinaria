import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DetalleCompraAgroInsumo } from './detalle-compra-agro-insumo.entity';
import { InvLoteAgroInsumo } from './inv-lote-agro-insumo.entity';

export enum TipoPago {
  CONTADO = 'CONTADO',
  CREDITO = 'CREDITO',
}

@Entity('compra_agro_insumos')
export class CompraAgroInsumo {
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

  @Column({
    type: 'enum',
    enum: TipoPago,
    default: TipoPago.CONTADO,
  })
  tipo_pago: TipoPago;

  @Column({ type: 'varchar', length: 100, nullable: true })
  numero_factura: string;

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

  @OneToMany(() => DetalleCompraAgroInsumo, (detalle) => detalle.compra)
  detalles: DetalleCompraAgroInsumo[];

  @OneToMany(() => InvLoteAgroInsumo, (lote) => lote.compra)
  lotes: InvLoteAgroInsumo[];

  @ManyToOne(() => DatosAgroservicio)
  agroservicio: DatosAgroservicio;

  @Column({ type: 'uuid' })
  agroservicioId: string;
}
