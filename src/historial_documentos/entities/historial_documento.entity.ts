import { HistorialDetalle } from 'src/historial_detalles/entities/historial_detalle.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('historial_documento')
export class HistorialDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  url: string;

  @Column()
  key: string;

  @Column()
  mimeType: string;

  @ManyToOne(() => HistorialDetalle, (detalle) => detalle.documentos)
  @JoinColumn({ name: 'detalle_id' })
  detalle: HistorialDetalle;

  @CreateDateColumn()
  createdAt: Date;
}
