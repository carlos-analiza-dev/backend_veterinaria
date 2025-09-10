import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('datos_productos')
export class DatosProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'productoId' })
  producto: SubServicio;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'sucursalId' })
  sucursal: Sucursal;

  @Column({ type: 'int', default: 10 })
  punto_reorden: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  descuento: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
