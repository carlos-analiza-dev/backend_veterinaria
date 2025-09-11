import { Pai } from 'src/pais/entities/pai.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
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

  @ManyToOne(() => Proveedor, { eager: false })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor;

  @ManyToOne(() => Pai, { eager: false })
  @JoinColumn({ name: 'paisId' })
  pais: Pai;

  @Column({ type: 'int' })
  cantidad_comprada: number;

  @Column({ type: 'float' })
  descuentos: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
