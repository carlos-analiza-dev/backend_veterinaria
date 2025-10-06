import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('detalles-factura')
export class FacturaDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FacturaEncabezado, (factura) => factura.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_factura' })
  factura: FacturaEncabezado;

  @Column({ name: 'id_factura' })
  id_factura: string;

  @ManyToOne(() => SubServicio, { eager: true })
  @JoinColumn({ name: 'id_producto_servicio' })
  producto_servicio: SubServicio;

  @Column({ name: 'id_producto_servicio' })
  id_producto_servicio: string;

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
