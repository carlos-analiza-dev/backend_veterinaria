import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('images_actividades')
export class ActividadFoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @ManyToOne(() => ActividadesDiaria, (actividad) => actividad.fotos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'actividadId' })
  actividad: ActividadesDiaria;

  @Column({ type: 'uuid' })
  actividadId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
