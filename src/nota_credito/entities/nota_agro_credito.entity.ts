import { AgroFacturacion } from 'src/agro_facturacion/entities/agro_facturacion.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { DetallesAgroNotaCredito } from 'src/detalles_nota_credito/entities/detalles_agro_nota_credito.entity';
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

@Entity('notas_credito_agro')
export class AgroNotaCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroFacturacion)
  @JoinColumn({ name: 'factura_id' })
  factura: AgroFacturacion;

  @Column({ name: 'factura_id' })
  factura_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'varchar', length: 500 })
  motivo: string;

  @ManyToOne(() => DatosAgroservicio)
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;

  @Column({ name: 'agroservicioId' })
  agroservicioId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DetallesAgroNotaCredito, (detalle) => detalle.notaCredito)
  detalles: DetallesAgroNotaCredito[];
}
