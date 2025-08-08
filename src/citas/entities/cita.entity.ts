import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { User } from 'src/auth/entities/auth.entity';
import { CitaInsumo } from 'src/cita_insumos/entities/cita_insumo.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { EstadoCita } from 'src/interfaces/estados_citas';
import { Medico } from 'src/medicos/entities/medico.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Medico, (medico) => medico.citas)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @ManyToMany(() => AnimalFinca, { eager: true })
  @JoinTable({
    name: 'cita_animales',
    joinColumn: {
      name: 'citaId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'animalId',
      referencedColumnName: 'id',
    },
  })
  animales: AnimalFinca[];

  @ManyToOne(() => FincasGanadero, { eager: true })
  @JoinColumn({ name: 'fincaId' })
  finca: FincasGanadero;

  @OneToMany(() => CitaInsumo, (citaInsumo) => citaInsumo.cita, { eager: true })
  insumosUsados: CitaInsumo[];

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'subServicioId' })
  subServicio: SubServicio;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  user: User;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int', default: 1 })
  cantidadAnimales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPagar: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalFinal: number;

  @Column({ type: 'int', default: 1 })
  duracion: number;

  @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.PENDIENTE })
  estado: EstadoCita;
}
