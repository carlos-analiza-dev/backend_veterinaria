import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TipoMovimiento {
  SALIDA = 'SALIDA',
  DEVOLUCION = 'DEVOLUCION',
  AJUSTE = 'AJUSTE',
}

@Entity('movimientos_lotes')
export class MovimientosLote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @Column({ name: 'lote_id' })
  lote_id: string;

  @ManyToOne(() => FacturaEncabezado, { nullable: true })
  @JoinColumn({ name: 'factura_id' })
  factura: FacturaEncabezado;

  @Column({ name: 'factura_id', nullable: true })
  factura_id: string;

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'producto_id' })
  producto: SubServicio;

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
