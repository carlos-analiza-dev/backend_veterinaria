import { CompraInsumo } from './compra-insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('inv_lotes_insumos_compra')
export class InvLoteInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CompraInsumo)
  @JoinColumn({ name: 'compraId' })
  compra: CompraInsumo;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'sucursalId' })
  sucursal: Sucursal;

  @ManyToOne(() => Insumo)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo_por_unidad: number; // (subtotal + impuestos - descuentos) / cantidad_total
}
