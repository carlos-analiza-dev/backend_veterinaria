import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompraAgroInsumo } from './compra-agro-insumo.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';

@Entity('inv_lotes_agro_insumos_compra')
export class InvLoteAgroInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CompraAgroInsumo)
  @JoinColumn({ name: 'compraId' })
  compra: CompraAgroInsumo;

  @ManyToOne(() => AgroSucursale)
  @JoinColumn({ name: 'sucursalId' })
  sucursal: AgroSucursale;

  @ManyToOne(() => AgroInsumos)
  @JoinColumn({ name: 'insumoId' })
  insumo: AgroInsumos;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo_por_unidad: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
