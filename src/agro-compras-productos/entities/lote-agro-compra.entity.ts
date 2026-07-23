import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgroComprasProducto } from './agro-compras-producto.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';

@Entity('lotes-agro-productos')
export class LoteAgroProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroComprasProducto, { nullable: true, cascade: true })
  @JoinColumn({ name: 'id_compra' })
  compra: AgroComprasProducto;

  @Column({ type: 'uuid', nullable: true })
  id_compra?: string;

  @ManyToOne(() => AgroSucursale, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: AgroSucursale;

  @Column({ type: 'uuid', nullable: true })
  id_sucursal: string;

  @ManyToOne(() => AgroProducto, { nullable: true })
  @JoinColumn({ name: 'id_producto' })
  producto: AgroProducto;

  @Column({ type: 'uuid', nullable: true })
  id_producto: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costo_por_unidad?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
