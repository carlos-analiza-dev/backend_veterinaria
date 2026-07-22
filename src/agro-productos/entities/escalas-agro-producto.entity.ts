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

@Entity('escalas_agro_producto')
export class EscalasProductoAgro {
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

  @Column({ type: 'int', default: 0 })
  bonificacion: number;

  @Column({ type: 'float' })
  costo: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
