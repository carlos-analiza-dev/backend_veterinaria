import { Cita } from 'src/citas/entities/cita.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('cita_insumos')
export class CitaInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cita, (cita) => cita.insumosUsados)
  @JoinColumn({ name: 'citaId' })
  cita: Cita;

  @ManyToOne(() => Insumo, (insumo) => insumo.citas, { eager: true })
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;
}
