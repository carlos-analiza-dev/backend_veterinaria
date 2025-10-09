import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { DescuentosCliente } from 'src/descuentos_clientes/entities/descuentos_cliente.entity';
import { FacturaDetalle } from 'src/factura_detalle/entities/factura_detalle.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { RangoFactura } from 'src/rangos-factura/entities/rango-factura.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FormaPago {
  CREDITO = 'Credito',
  CONTADO = 'Contado',
}

export enum EstadoFactura {
  EMITIDA = 'Emitida',
  PROCESADA = 'Procesada',
  CANCELADA = 'Cancelada',
}

@Entity('encabezado-factura')
export class FacturaEncabezado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @Column({ name: 'id_cliente' })
  id_cliente: string;

  @ManyToOne(() => Pai)
  @JoinColumn({ name: 'pais_id' })
  pais: Pai;

  @Column({ name: 'pais_id' })
  pais_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @OneToMany(() => FacturaDetalle, (detalle) => detalle.factura)
  detalles: FacturaDetalle[];

  @Column({
    type: 'enum',
    enum: FormaPago,
    default: FormaPago.CONTADO,
  })
  forma_pago: FormaPago;

  @Column({
    type: 'enum',
    enum: EstadoFactura,
    default: EstadoFactura.EMITIDA,
  })
  estado: EstadoFactura;

  @Column({ unique: true, length: 30 })
  numero_factura: string;

  @Column({ type: 'date' })
  fecha_limite_emision: Date;

  @Column({ type: 'date' })
  fecha_recepcion: Date;

  @Column({ type: 'varchar', length: 50 })
  rango_autorizado: string;

  @Column({ type: 'varchar', length: 100 })
  cai: string;

  @ManyToOne(() => RangoFactura)
  @JoinColumn({ name: 'rango_factura_id' })
  rango_factura: RangoFactura;

  @Column({ name: 'rango_factura_id' })
  rango_factura_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sub_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuentos_rebajas: number;

  @ManyToOne(() => DescuentosCliente, { eager: true, nullable: true })
  @JoinColumn({ name: 'descuento_id' })
  descuento: DescuentosCliente;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  importe_exento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  importe_exonerado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  importe_gravado_15: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  importe_gravado_18: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  isv_15: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  isv_18: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column('text')
  total_letras: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
