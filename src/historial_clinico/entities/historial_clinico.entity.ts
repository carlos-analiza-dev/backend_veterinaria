import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { HistorialDetalle } from 'src/historial_detalles/entities/historial_detalle.entity';
import { User } from 'src/auth/entities/auth.entity';

@Entity('historial_clinico')
export class HistorialClinico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimalFinca, { eager: true })
  @JoinColumn({ name: 'animal_id' })
  animal: AnimalFinca;

  @ManyToOne(() => Cita, { nullable: true })
  @JoinColumn({ name: 'cita_id' })
  cita?: Cita;

  @Column({ type: 'text', nullable: true })
  resumen?: string;

  @OneToMany(() => HistorialDetalle, (detalle) => detalle.historial, {
    cascade: true,
  })
  detalles: HistorialDetalle[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
