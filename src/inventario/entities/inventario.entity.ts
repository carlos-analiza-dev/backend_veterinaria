import { Insumo } from 'src/insumos/entities/insumo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('inventarios_insumos')
export class Inventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Insumo, (insumo) => insumo.inventario, {
    cascade: true,
  })
  @JoinColumn()
  insumo: Insumo;

  @Column({ type: 'int' })
  cantidadDisponible: number;

  @Column({ type: 'int' })
  stockMinimo: number;
}
