import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import {
  EstadoCria,
  EstadoParto,
  SexoCria,
  TipoParto,
} from 'src/interfaces/partos.enums';

@Entity('partos_animales')
export class PartoAnimal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimalFinca, (animal) => animal.partos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hembra_id' })
  hembra: AnimalFinca;

  @ManyToOne(() => ServicioReproductivo, { nullable: true })
  @JoinColumn({ name: 'servicio_id' })
  servicio_asociado: ServicioReproductivo;

  @Column({ type: 'timestamp' })
  fecha_parto: Date;

  @Column({ type: 'int' })
  numero_parto: number;

  @Column({
    type: 'enum',
    enum: TipoParto,
    default: TipoParto.NORMAL,
  })
  tipo_parto: TipoParto;

  @Column({
    type: 'enum',
    enum: EstadoParto,
    default: EstadoParto.PROGRAMADO,
  })
  estado: EstadoParto;

  @Column({ type: 'int', default: 1 })
  numero_crias: number;

  @Column({ type: 'int', default: 0 })
  numero_crias_vivas: number;

  @Column({ type: 'int', default: 0 })
  numero_crias_muertas: number;

  @Column({ type: 'jsonb', nullable: true })
  crias: Array<{
    id?: string;
    sexo: SexoCria;
    peso: number;
    estado: EstadoCria;
    observaciones?: string;
    identificador?: string;
    fecha_nacimiento: Date;
  }>;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  complicaciones: string;

  @Column({ type: 'text', nullable: true })
  atencion_veterinaria: string;

  @Column({ type: 'varchar', nullable: true })
  veterinario_responsable: string;

  @Column({ type: 'int', nullable: true })
  dias_gestacion: number;

  @Column({ type: 'int', nullable: true })
  semanas_gestacion: number;

  @CreateDateColumn()
  fecha_registro: Date;

  @UpdateDateColumn()
  ultima_actualizacion: Date;
}
