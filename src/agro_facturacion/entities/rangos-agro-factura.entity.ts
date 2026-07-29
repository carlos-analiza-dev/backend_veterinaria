import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('agro_rangos_factura')
export class AgroRangoFactura {
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

  @ManyToOne(() => DatosAgroservicio, (datos) => datos.rango_factura, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
