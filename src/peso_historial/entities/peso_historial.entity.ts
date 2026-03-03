import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';

@Entity('peso_historial')
export class PesoHistorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  peso: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar', default: 'N/A' })
  observaciones: string;

  @ManyToOne(() => AnimalFinca, (animal) => animal.pesos, {
    onDelete: 'CASCADE',
  })
  animal: AnimalFinca;

  @CreateDateColumn()
  fechaRegistro: Date;
}
