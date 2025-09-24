import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoRango {
  ACTIVO = 'activo',
  AGOTADO = 'agotado',
  VENCIDO = 'vencido',
  ANULADO = 'anulado',
}

@Entity('rangos_factura')
export class RangoFactura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  cai: string;

  @Column({ length: 15 })
  prefijo: string;

  @Column('integer')
  rango_inicial: number;

  @Column('integer')
  rango_final: number;

  @Column('integer')
  correlativo_actual: number;

  @Column('date')
  fecha_recepcion: Date;

  @Column('date')
  fecha_limite_emision: Date;

  @Column({
    type: 'enum',
    enum: EstadoRango,
    default: EstadoRango.ACTIVO,
  })
  estado: EstadoRango;

  @Column('json', { nullable: true })
  facturas_anuladas: number[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}