import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { DetalleServicio } from 'src/detalles_servicio_reproductivo/entities/detalles_servicio_reproductivo.entity';
import {
  EstadoServicio,
  TipoServicio,
} from 'src/interfaces/servicios-reproductivos.enum';

@Entity('servicios_reproductivos')
export class ServicioReproductivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimalFinca)
  @JoinColumn({ name: 'hembra_id' })
  hembra: AnimalFinca;

  @ManyToOne(() => AnimalFinca, { nullable: true })
  @JoinColumn({ name: 'macho_id' })
  macho: AnimalFinca;

  @Column({ type: 'enum', enum: TipoServicio })
  tipo_servicio: TipoServicio;

  @Column({
    type: 'enum',
    enum: EstadoServicio,
    default: EstadoServicio.PROGRAMADO,
  })
  estado: EstadoServicio;

  @Column({ type: 'timestamp' })
  fecha_servicio: Date;

  @Column({ type: 'int', nullable: true })
  numero_servicio: number;

  @ManyToOne(() => CelosAnimal, { nullable: true })
  @JoinColumn({ name: 'celo_id' })
  celo_asociado: CelosAnimal;

  @Column({ nullable: true })
  dosis_semen: string;

  @Column({ nullable: true })
  proveedor_semen: string;

  @Column({ nullable: true })
  tecnico_responsable: string;

  @Column({ type: 'boolean', default: false })
  exitoso: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => DetalleServicio, (detalle) => detalle.servicio, {
    cascade: true,
  })
  detalles: DetalleServicio[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    costo?: number;
    duracion_minutos?: number;
    condiciones_climaticas?: string;
    evaluacion_macho?: string;
  };

  @CreateDateColumn()
  fecha_registro: Date;

  @UpdateDateColumn()
  ultima_actualizacion: Date;
}
