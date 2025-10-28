import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { CitaInsumo } from 'src/cita_insumos/entities/cita_insumo.entity';
import { CitaProducto } from 'src/cita_productos/entities/cita_producto.entity';
import { HistorialClinico } from 'src/historial_clinico/entities/historial_clinico.entity';

@Entity('detalles_historial_clinico')
export class HistorialDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HistorialClinico, (historial) => historial.detalles)
  @JoinColumn({ name: 'historial_id' })
  historial: HistorialClinico;

  @ManyToOne(() => SubServicio, { nullable: true })
  @JoinColumn({ name: 'sub_servicio_id' })
  subServicio?: SubServicio;

  @OneToMany(() => CitaInsumo, (insumo) => insumo.cita, { nullable: true })
  insumos?: CitaInsumo[];

  @OneToMany(() => CitaProducto, (producto) => producto.cita, {
    nullable: true,
  })
  productos?: CitaProducto[];

  @Column({ type: 'text', nullable: true })
  diagnostico?: string;

  @Column({ type: 'text', nullable: true })
  tratamiento?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
