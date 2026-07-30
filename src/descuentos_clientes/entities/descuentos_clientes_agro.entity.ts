import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('descuentos_agro_clientes')
export class DescuentosAgroCliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje: number;

  @ManyToOne(() => DatosAgroservicio, (datos) => datos.descuentos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;
}
