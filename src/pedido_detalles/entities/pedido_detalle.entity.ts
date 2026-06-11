import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Pedido } from 'src/pedidos/entities/pedido.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';

@Entity('pedido_detalles')
export class PedidoDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @Column({ type: 'uuid' })
  id_pedido: string;

  @ManyToOne(() => SubServicio, { eager: true })
  @JoinColumn({ name: 'id_producto' })
  producto: SubServicio;

  @Column({ type: 'uuid' })
  id_producto: string;

  @ManyToOne(() => Sucursal, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  id_sucursal: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  calcularTotal() {
    this.total = this.cantidad * this.precio;
  }
}
