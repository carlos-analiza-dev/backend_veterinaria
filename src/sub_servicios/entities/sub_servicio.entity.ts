import { Medico } from 'src/medicos/entities/medico.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';
import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CitaProducto } from 'src/cita_productos/entities/cita_producto.entity';

export enum UnidadVenta {
  UNIDAD = 'unidad',
  KILOGRAMO = 'kilogramo',
  LIBRA = 'libra',
  GALON = 'galon',
  METRO = 'metro',
  PIE = 'pie',
  M2 = 'm2',
}

export enum TipoSubServicio {
  PRODUCTO = 'producto',
  SERVICIO = 'servicio',
}

@Entity('sub_servicios')
export class SubServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ length: 50 })
  codigo: string;

  @Column({
    type: 'enum',
    enum: TipoSubServicio,
    default: TipoSubServicio.SERVICIO,
  })
  tipo: TipoSubServicio;

  @Column({
    type: 'enum',
    enum: UnidadVenta,
    default: UnidadVenta.UNIDAD,
  })
  unidad_venta: UnidadVenta;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'servicio_id', nullable: true })
  servicioId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ default: true })
  disponible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Servicio, (servicio) => servicio.subServicios, {
    nullable: true,
  })
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @OneToMany(() => ServiciosPai, (precio) => precio.subServicio, {
    eager: true,
    cascade: true,
  })
  preciosPorPais: ServiciosPai[];

  @ManyToMany(() => Medico, (medico) => medico.areas_trabajo)
  medicos: Medico[];

  @OneToOne(() => InventarioProducto, (inventario) => inventario.producto, {
    nullable: true,
  })
  inventario?: InventarioProducto;

  @OneToMany(() => CitaProducto, (citaProducto) => citaProducto.producto)
  citas: CitaProducto[];
}
