import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgroProducto } from './agro-producto.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Entity('descuentos_agro_producto')
export class DescuentosProductoAgro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroProducto)
  @JoinColumn({ name: 'productoId' })
  producto: AgroProducto;

  @ManyToOne(() => AgroProveedore, { eager: false })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: AgroProveedore;

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
