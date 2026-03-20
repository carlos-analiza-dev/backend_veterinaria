import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import {
  DeteccionCelo,
  EstadoCeloAnimal,
  IntensidadCelosAnimal,
} from 'src/interfaces/celos.animal.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('celos_animal')
export class CelosAnimal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimalFinca, (animal) => animal.celos, {
    onDelete: 'CASCADE',
  })
  animal: AnimalFinca;

  @Column({ type: 'timestamp' })
  fechaInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaFin: Date;

  @Column({ type: 'int', default: 1 })
  numeroCelo: number;

  @Column({
    type: 'enum',
    enum: IntensidadCelosAnimal,
    default: IntensidadCelosAnimal.MEDIO,
  })
  intensidad: string;

  @Column({
    type: 'enum',
    enum: DeteccionCelo,
    default: DeteccionCelo.VISUAL,
  })
  metodo_deteccion: string;

  @Column({ type: 'varchar', default: 'N/A' })
  observaciones: string;

  @Column({
    type: 'enum',
    enum: EstadoCeloAnimal,
    default: EstadoCeloAnimal.ACTIVO,
  })
  estado: EstadoCeloAnimal;

  @Column({ type: 'jsonb', nullable: true })
  signos_observados: {
    monta_otros: boolean;
    acepta_monta: boolean;
    inquietud: boolean;
    secreciones: string;
    vulva_inflamada: boolean;
    otros: string[];
  };

  @CreateDateColumn()
  fechaRegistro: Date;
}
