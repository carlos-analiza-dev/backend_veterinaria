import { Compra } from 'src/compras/entities/compra.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Compra, { nullable: true ,cascade:true})
  @JoinColumn({ name: 'id_compra' })
  compra: Compra;

  @Column({ type: 'uuid', nullable: true })
  id_compra: string;

  @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;

  @Column({ type: 'uuid', nullable: true })
  id_sucursal: string;

  @ManyToOne(() => SubServicio, { nullable: true })
  @JoinColumn({ name: 'id_producto' })
  producto: SubServicio;

  @Column({ type: 'uuid', nullable: true })
  id_producto: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;
}
