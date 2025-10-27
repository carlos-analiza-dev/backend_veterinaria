import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Entity('servicio_insumos')
export class ServicioInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'servicio_pais_id' })
  servicioPaisId: string;

  @Column({ name: 'insumo_id' })
  insumoId: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @ManyToOne(() => ServiciosPai, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'servicio_pais_id' })
  servicioPais: ServiciosPai;

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
