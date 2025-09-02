import { Pai } from 'src/pais/entities/pai.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @OneToMany(() => SubServicio, (subServicio) => subServicio.servicio, {
    eager: true,
    cascade: true,
  })
  subServicios: SubServicio[];

  @ManyToOne(() => Pai, (pais) => pais.servicios, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'pais_id' })
  pais: Pai;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
