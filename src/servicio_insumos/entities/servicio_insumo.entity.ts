import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Entity('servicio_insumos')
export class ServicioInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'servicio_id' })
  servicioId: string;

  @Column({ name: 'insumo_id' })
  insumoId: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @ManyToOne(() => SubServicio, (servicio) => servicio.insumos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'servicio_id' })
  servicio: SubServicio;

  @ManyToOne(() => Insumo, (insumo) => insumo.servicios, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'insumo_id' })
  insumo: Insumo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
