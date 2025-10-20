import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PedidoDetalle } from 'src/pedido_detalles/entities/pedido_detalle.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  PROCESADO = 'procesado',
  FACTURADO = 'facturado',
  CANCELADO = 'cancelado',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @Column({ type: 'uuid' })
  id_cliente: string;

  @ManyToOne(() => Sucursal, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;

  @Column({ type: 'uuid', nullable: true })
  id_sucursal?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @OneToMany(() => PedidoDetalle, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: PedidoDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
