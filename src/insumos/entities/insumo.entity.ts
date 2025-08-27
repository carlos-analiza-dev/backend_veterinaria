import { CitaInsumo } from 'src/cita_insumos/entities/cita_insumo.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { ServicioInsumo } from 'src/servicio_insumos/entities/servicio_insumo.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UnidadVenta {
  UNIDAD = 'unidad',
  KILOGRAMO = 'kilogramo',
  LIBRA = 'libra',
  GALON = 'galon',
  METRO = 'metro',
  PIE = 'pie',
  M2 = 'm2',
}

@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo: number;

  @Column({
    type: 'enum',
    enum: UnidadVenta,
    default: UnidadVenta.UNIDAD,
  })
  unidad_venta: UnidadVenta;

  @Column({ default: true })
  disponible: boolean;

  @ManyToOne(() => Marca, (marca) => marca.insumos, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca | null;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.insumos, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor | null;

  @ManyToOne(() => Pai, (pais) => pais.insumos, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'pais_id' })
  pais: Pai | null;

  @OneToOne(() => Inventario, (inventario) => inventario.insumo, {
    eager: true,
  })
  inventario: Inventario;

  @OneToMany(() => ServicioInsumo, (servicioInsumo) => servicioInsumo.insumo)
  servicios: ServicioInsumo[];

  @OneToMany(() => CitaInsumo, (citaInsumo) => citaInsumo.insumo)
  citas: CitaInsumo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
