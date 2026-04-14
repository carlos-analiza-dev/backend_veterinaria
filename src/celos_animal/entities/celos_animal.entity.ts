import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  DeteccionCelo,
  EstadoCeloAnimal,
  IntensidadCelosAnimal,
} from 'src/interfaces/celos.animal.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @Column({ nullable: true })
  creadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'creadoPorId' })
  creado_por: Cliente;

  @Column({ nullable: true })
  actualizadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'actualizadoPorId' })
  actualizado_por: Cliente;
}
