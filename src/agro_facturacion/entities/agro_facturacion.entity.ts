import { DescuentosAgroCliente } from 'src/descuentos_clientes/entities/descuentos_clientes_agro.entity';
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
import { AgroRangoFactura } from './rangos-agro-factura.entity';
import {
  EstadoFactura,
  FormaPago,
} from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AgroCliente } from 'src/agro_clientes/entities/agro_cliente.entity';
import { AgroFacturaDetalle } from './agro_factura_detalle.entity';

@Entity('agro_facturacion')
export class AgroFacturacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroCliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente: AgroCliente;

  @Column({ name: 'id_cliente' })
  id_cliente: string;

  @ManyToOne(() => DatosAgroservicio)
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;

  @Column({ name: 'agroservicioId' })
  agroservicioId: string;

  @ManyToOne(() => AgroSucursale)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: AgroSucursale;

  @Column({ name: 'sucursal_id' })
  sucursal_id: string;

  @OneToMany(() => AgroFacturaDetalle, (detalle) => detalle.factura)
  detalles: AgroFacturaDetalle[];

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

  @Column({ type: 'boolean', default: false })
  autorizada_cancelacion: boolean;

  @ManyToOne(() => AgroRangoFactura)
  @JoinColumn({ name: 'rango_factura_id' })
  rango_factura: AgroRangoFactura;

  @Column({ name: 'rango_factura_id' })
  rango_factura_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sub_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuentos_rebajas: number;

  @ManyToOne(() => DescuentosAgroCliente, { eager: true, nullable: true })
  @JoinColumn({ name: 'descuento_id' })
  descuento: DescuentosAgroCliente;

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cargos_extra: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column('text')
  total_letras: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_autorizacion_cancelacion: Date;
}
