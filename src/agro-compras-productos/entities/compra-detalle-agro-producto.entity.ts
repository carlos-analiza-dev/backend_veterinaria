import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AgroComprasProducto } from './agro-compras-producto.entity';
import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';

@Entity('compras_detalles_agro_producto')
export class CompraDetalleAgroProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroComprasProducto, (compra) => compra.detalles, {
    onDelete: 'CASCADE',
  })
  compra: AgroComprasProducto;

  @Column({ type: 'uuid' })
  compraId: string;

  @ManyToOne(() => AgroProducto, { nullable: true })
  producto?: AgroProducto;

  @Column({ type: 'uuid', nullable: true })
  productoId?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costo_por_unidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  bonificacion: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  cantidad_total: number; // cantidad + bonificacion

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuentos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monto_total: number; // (cantidad_total * costo_por_unidad) - descuentos + impuestos
}
