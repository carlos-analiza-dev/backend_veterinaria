import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('descuentos_producto')
export class DescuentosProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'productoId' })
  producto: SubServicio;

  @Column({ type: 'int' })
  cantidad_comprada: number;

  @Column({ type: 'float' })
  descuentos: number;
}
