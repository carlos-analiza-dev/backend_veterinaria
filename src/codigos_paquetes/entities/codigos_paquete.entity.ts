import { Paquete } from 'src/paquetes/entities/paquete.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('codigos_paquetes')
@Unique(['codigo'])
export class CodigosPaquete {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  codigo: string;

  @ManyToOne(() => Paquete, { nullable: false })
  @JoinColumn({ name: 'paquete_id' })
  paquete: Paquete;

  @Column({ name: 'paquete_id', type: 'uuid' })
  paqueteId: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ name: 'fecha_expiracion', type: 'timestamp', nullable: true })
  fechaExpiracion: Date | null;
}
