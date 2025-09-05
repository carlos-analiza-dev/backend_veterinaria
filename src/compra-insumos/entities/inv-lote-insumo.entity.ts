import { CompraInsumo } from './compra-insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inv_lotes_insumos')
export class InvLoteInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CompraInsumo)
  compra: CompraInsumo;

  @Column({ type: 'uuid', nullable: true })
  compraId: string;

  @ManyToOne(() => Sucursal)
  sucursal: Sucursal;

  @Column({ type: 'uuid', nullable: true })
  sucursalId: string;

  @ManyToOne(() => Insumo)
  insumo: Insumo;

  @Column({ type: 'uuid', nullable: true })
  insumoId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo_por_unidad: number; // Costo prorrateado = (subtotal + impuestos - descuentos) / cantidad_total
}
