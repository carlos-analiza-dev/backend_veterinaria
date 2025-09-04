import { Compra } from 'src/compras/entities/compra.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Compra, { nullable: true })
  compra?: Compra;

  @Column({ type: 'uuid', nullable: true })
  id_compra?: string;

  @ManyToOne(() => Compra, { nullable: true })
  compra_insumo?: Compra;

  @Column({ type: 'uuid', nullable: true })
  id_compra_insumo?: string;

  @ManyToOne(() => Sucursal)
  sucursal: Sucursal;

  @Column({ type: 'uuid', nullable: true })
  id_sucursal: string;

  @ManyToOne(() => SubServicio, { nullable: true })
  producto?: SubServicio;

  @Column({ type: 'uuid', nullable: true })
  id_producto?: string;

  @ManyToOne(() => Insumo, { nullable: true })
  insumo?: Insumo;

  @Column({ type: 'uuid', nullable: true })
  id_insumo?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;
}
