import { Compra } from 'src/compras/entities/compra.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Compra)
  compra: Compra;

  @Column({ type: 'uuid' })
  id_compra: string;

  @ManyToOne(() => Sucursal)
  sucursal: Sucursal;

  @Column({ type: 'uuid' })
  id_sucursal: string;

  @ManyToOne(() => Insumo)
  producto: Insumo;

  @Column({ type: 'uuid' })
  id_producto: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;
}