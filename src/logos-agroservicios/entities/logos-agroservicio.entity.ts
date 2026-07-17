import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('logos-agroservicios')
export class LogosAgroservicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => DatosAgroservicio, (agroservicio) => agroservicio.logo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;

  @Column()
  agroservicioId: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
