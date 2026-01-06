import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('producto_rating_resumen')
export class ProductoRatingResumen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => SubServicio, { onDelete: 'CASCADE' })
  @JoinColumn()
  producto: SubServicio;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  promedio: number;

  @Column({ type: 'int', default: 0 })
  total_opiniones: number;

  @Column({ type: 'int', default: 0 })
  estrellas_1: number;

  @Column({ type: 'int', default: 0 })
  estrellas_2: number;

  @Column({ type: 'int', default: 0 })
  estrellas_3: number;

  @Column({ type: 'int', default: 0 })
  estrellas_4: number;

  @Column({ type: 'int', default: 0 })
  estrellas_5: number;
}
