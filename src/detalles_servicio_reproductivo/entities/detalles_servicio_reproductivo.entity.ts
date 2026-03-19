import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('detalles_servicio_reproductivo')
export class DetalleServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServicioReproductivo, (servicio) => servicio.detalles)
  @JoinColumn({ name: 'servicio_id' })
  servicio: ServicioReproductivo;

  @Column({ type: 'time' })
  hora_servicio: string;

  @Column({ type: 'int' })
  numero_monta: number;

  @Column({ nullable: true })
  duracion_minutos: number;

  @Column({ type: 'text', nullable: true })
  observaciones_monta: string;

  @Column({ type: 'jsonb', nullable: true })
  comportamiento: {
    aceptacion_macho: boolean;
    receptividad: string;
    signos_observados: string[];
  };
}
