import { Pai } from 'src/pais/entities/pai.entity';
import { ServicioInsumo } from 'src/servicio_insumos/entities/servicio_insumo.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('servicios_pais')
export class ServiciosPai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubServicio, (subServicio) => subServicio.preciosPorPais)
  @JoinColumn({ name: 'sub_servicio_id' })
  subServicio: SubServicio;

  @ManyToOne(() => Pai, (pais) => pais.preciosServicios, { eager: true })
  pais: Pai;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costo: number;

  @Column({ type: 'int', nullable: true })
  tiempo?: number;

  @Column({ type: 'int', nullable: true })
  cantidadMin?: number;

  @Column({ type: 'int', nullable: true })
  cantidadMax?: number;

  @OneToMany(
    () => ServicioInsumo,
    (servicioInsumo) => servicioInsumo.servicioPais,
  )
  insumos: ServicioInsumo[];
}
