import { TipoMovimientoInventario } from "src/interfaces/movimientos-inventario/tipos_movimientos.enum";
import { Lote } from "src/lotes/entities/lote.entity";
import { Sucursal } from "src/sucursales/entities/sucursal.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('movimientos_inventario')
export class MovimientosInventario {
     @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lote)
  lote: Lote;

  @Column({type:'enum',enum:TipoMovimientoInventario})
  tipo: TipoMovimientoInventario;

  @Column('decimal', { precision: 12, scale: 2 })
  cantidad: number;
  
 @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'sucursal_origen_id' })
  sucursalOrigen?: Sucursal;

  @Column({ name: 'sucursal_origen_id', type: 'uuid', nullable: true })
  sucursal_origen_id?: string;


  @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'sucursal_destino_id' })
  sucursalDestino?: Sucursal;

  @Column({ name: 'sucursal_destino_id', type: 'uuid', nullable: true })
  sucursal_destino_id?: string;


  @CreateDateColumn()
  created_at: Date;
}
