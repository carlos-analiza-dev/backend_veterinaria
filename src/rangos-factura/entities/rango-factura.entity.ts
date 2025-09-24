import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rangos_factura')
export class RangoFactura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
