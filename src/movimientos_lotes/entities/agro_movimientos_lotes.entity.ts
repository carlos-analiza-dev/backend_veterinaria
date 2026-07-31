import { LoteAgroProducto } from 'src/agro-compras-productos/entities/lote-agro-compra.entity';
import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';
import { AgroFacturacion } from 'src/agro_facturacion/entities/agro_facturacion.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoMovimiento } from './movimientos_lote.entity';

@Entity('agro_movimientos_lotes')
export class AgroMovimientosLote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LoteAgroProducto)
  @JoinColumn({ name: 'lote_id' })
  lote: LoteAgroProducto;

  @Column({ name: 'lote_id' })
  lote_id: string;

  @ManyToOne(() => AgroFacturacion, { nullable: true })
  @JoinColumn({ name: 'factura_id' })
  factura: AgroFacturacion;

  @Column({ name: 'factura_id', nullable: true })
  factura_id: string;

  @ManyToOne(() => AgroProducto)
  @JoinColumn({ name: 'producto_id' })
  producto: AgroProducto;

  @Column({ name: 'producto_id' })
  producto_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({
    type: 'enum',
    enum: TipoMovimiento,
    default: TipoMovimiento.SALIDA,
  })
  tipo: TipoMovimiento;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn()
  fecha: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad_anterior: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad_nueva: number;
}
