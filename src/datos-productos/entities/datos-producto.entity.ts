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
  Unique,
} from 'typeorm';

@Entity('datos_productos')
@Unique(['sub_servicioId', 'sucursalId'])
export class DatosProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubServicio, { eager: false })
  @JoinColumn({ name: 'sub_servicioId' })
  sub_servicio: SubServicio;
  
  @Column('uuid')
  sub_servicioId: string;

  @ManyToOne(() => Sucursal, { eager: false })
  @JoinColumn({ name: 'sucursalId' })
  sucursal: Sucursal;
  
  @Column('uuid')
  sucursalId: string;

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