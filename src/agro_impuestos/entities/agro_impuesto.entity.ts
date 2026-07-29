import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('agro_impuestos')
export class AgroImpuesto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje: number;

  @ManyToOne(() => DatosAgroservicio, (datos) => datos.impuestos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;
}
