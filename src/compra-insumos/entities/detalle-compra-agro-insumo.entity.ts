import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompraAgroInsumo } from './compra-agro-insumo.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';

@Entity('detalle_compra_agro_insumos')
export class DetalleCompraAgroInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CompraAgroInsumo, (compra) => compra.detalles, {
    onDelete: 'CASCADE',
  })
  compra: CompraAgroInsumo;

  @Column({ type: 'uuid' })
  compraId: string;

  @ManyToOne(() => AgroInsumos, { eager: false })
  insumo: AgroInsumos;

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
