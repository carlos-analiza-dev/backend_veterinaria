import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('inventario_productos')
export class InventarioProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => SubServicio, (producto) => producto.inventario, {
    cascade: true,
  })
  @JoinColumn()
  producto: SubServicio;

  @Column({ type: 'int' })
  cantidadDisponible: number;

  @Column({ type: 'int' })
  stockMinimo: number;
}
