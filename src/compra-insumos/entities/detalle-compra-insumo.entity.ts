import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompraInsumo } from './compra-insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Entity('detalle_compra_insumos')
export class DetalleCompraInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CompraInsumo, (compra) => compra.detalles, {
    onDelete: 'CASCADE',
  })
  compra: CompraInsumo;

  @Column({ type: 'uuid' })
  compraId: string;

  @ManyToOne(() => Insumo, { eager: false })
  insumo: Insumo;

  @Column({ type: 'uuid' })
  insumoId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo_por_unidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  bonificacion: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  cantidad_total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  descuentos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_total: number;
}