import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('escalas_producto')
export class EscalasProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'productoId' })
  producto: SubServicio;

  @Column({ type: 'int' })
  cantidad_comprada: number;

  @Column({ type: 'int', default: 0 })
  bonificacion: number;

  @Column({ type: 'float' })
  costo: number;
}
