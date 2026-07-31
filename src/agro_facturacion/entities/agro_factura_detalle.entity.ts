import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgroFacturacion } from './agro_facturacion.entity';

@Entity('agro-detalles-factura')
export class AgroFacturaDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroFacturacion, (factura) => factura.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_factura' })
  factura: AgroFacturacion;

  @Column({ name: 'id_factura' })
  id_factura: string;

  @ManyToOne(() => AgroProducto, { eager: true })
  @JoinColumn({ name: 'id_producto' })
  producto: AgroProducto;

  @Column({ name: 'id_producto' })
  id_producto: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  calcularTotal() {
    this.total = this.cantidad * this.precio;
  }
}
