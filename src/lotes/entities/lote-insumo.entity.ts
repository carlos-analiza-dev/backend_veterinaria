import { Compra } from 'src/compras/entities/compra.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inv_lotes_insumos')
export class LoteInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Compra, { nullable: true })
  compra_insumo?: Compra;

  @Column({ type: 'uuid', nullable: true })
  id_compra_insumo?: string;

  @ManyToOne(() => Sucursal)
  sucursal: Sucursal;

  @Column({ type: 'uuid', nullable: true })
  id_sucursal: string;

  @ManyToOne(() => Insumo)
  insumo: Insumo;

  @Column({ type: 'uuid', nullable: true })
  id_insumo: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costo_por_unidad?: number;
}