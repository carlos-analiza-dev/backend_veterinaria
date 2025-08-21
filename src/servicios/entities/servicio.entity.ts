import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
