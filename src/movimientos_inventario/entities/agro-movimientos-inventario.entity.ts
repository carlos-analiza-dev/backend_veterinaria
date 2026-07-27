import { LoteAgroProducto } from 'src/agro-compras-productos/entities/lote-agro-compra.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { TipoMovimientoInventario } from 'src/interfaces/movimientos-inventario/tipos_movimientos.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('agro_movimientos_inventario')
export class AgroMovimientosInventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LoteAgroProducto)
  lote: LoteAgroProducto;

  @Column({ type: 'enum', enum: TipoMovimientoInventario })
  tipo: TipoMovimientoInventario;

  @Column('decimal', { precision: 12, scale: 2 })
  cantidad: number;

  @ManyToOne(() => AgroSucursale, { nullable: true })
  @JoinColumn({ name: 'sucursal_origen_id' })
  sucursalOrigen?: AgroSucursale;

  @Column({ name: 'sucursal_origen_id', type: 'uuid', nullable: true })
  sucursal_origen_id?: string;

  @ManyToOne(() => AgroSucursale, { nullable: true })
  @JoinColumn({ name: 'sucursal_destino_id' })
  sucursalDestino?: AgroSucursale;

  @Column({ name: 'sucursal_destino_id', type: 'uuid', nullable: true })
  sucursal_destino_id?: string;

  @CreateDateColumn()
  created_at: Date;
}
