import { DetallesNotaCredito } from 'src/detalles_nota_credito/entities/detalles_nota_credito.entity';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { User } from 'src/auth/entities/auth.entity';
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

@Entity('notas_credito')
export class NotaCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FacturaEncabezado)
  @JoinColumn({ name: 'factura_id' })
  factura: FacturaEncabezado;

  @Column({ name: 'factura_id' })
  factura_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'varchar', length: 500 })
  motivo: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => Pai)
  @JoinColumn({ name: 'pais_id' })
  pais: Pai;

  @Column({ name: 'pais_id' })
  pais_id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DetallesNotaCredito, (detalle) => detalle.notaCredito)
  detalles: DetallesNotaCredito[];
}
