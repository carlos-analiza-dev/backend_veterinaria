import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Motivo {
  SIN_STOCK = 'Sin_Stock',
  VENTA_INCOMPLETA = 'Venta_Incompleta',
}

@Entity('productos_no_vendidos')
export class ProductosNoVendido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  producto_id: string;

  @Column({ type: 'uuid' })
  sucursal_id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_producto: string;

  @Column({ type: 'int' })
  cantidad_no_vendida: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_perdido: number;

  @Column({ type: 'int' })
  existencia_actual: number;

  @Column({ type: 'int' })
  cantidad_solicitada: number;

  @Column({
    type: 'enum',
    enum: Motivo,
    default: Motivo.SIN_STOCK,
  })
  motivo: Motivo;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'boolean', default: false })
  fue_reabastecido: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_reabastecimiento: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'producto_id' })
  producto: SubServicio;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;
}
