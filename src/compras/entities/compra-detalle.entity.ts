import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Compra } from './compra.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Entity('compras_detalles')
export class CompraDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Compra, (compra) => compra.detalles, {
    onDelete: 'CASCADE',
  })
  compra: Compra;

  @Column({ type: 'uuid' })
  compraId: string;

  @ManyToOne(() => SubServicio, { nullable: true })
  producto?: SubServicio;

  @Column({ type: 'uuid', nullable: true })
  productoId?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo_por_unidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  bonificacion: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  cantidad_total: number; // cantidad + bonificacion

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuentos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monto_total: number; // (cantidad_total * costo_por_unidad) - descuentos + impuestos
}
