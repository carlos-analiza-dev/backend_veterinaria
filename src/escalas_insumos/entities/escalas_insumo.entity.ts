import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('escalas_insumos')
export class EscalasInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Insumo)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @ManyToOne(() => Proveedor, { eager: false })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor;

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
