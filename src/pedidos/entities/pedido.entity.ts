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

export enum TipoEntrega {
  DELIVERY = 'delivery',
  RECOGER = 'recoger',
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

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  sub_total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  importe_exento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  importe_exonerado: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  importe_gravado_15: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  importe_gravado_18: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  isv_15: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  isv_18: number;

  // total general del pedido
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion_entrega: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number;

  @Column({
    type: 'enum',
    enum: TipoEntrega,
    default: TipoEntrega.RECOGER,
  })
  tipo_entrega: TipoEntrega;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costo_delivery: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_finca: string;

  @OneToMany(() => PedidoDetalle, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: PedidoDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
