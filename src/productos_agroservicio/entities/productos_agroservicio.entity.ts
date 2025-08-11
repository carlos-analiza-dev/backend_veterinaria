import { CitaProducto } from 'src/cita_productos/entities/cita_producto.entity';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('productos_agroservicio')
export class ProductosAgroservicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column()
  tipo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column()
  unidadMedida: string;

  @Column({ default: true })
  disponible: boolean;

  @OneToOne(() => InventarioProducto, (inventario) => inventario.producto, {
    eager: true,
  })
  inventario: InventarioProducto;

  @OneToMany(() => CitaProducto, (citaProducto) => citaProducto.producto)
  citas: CitaProducto[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
