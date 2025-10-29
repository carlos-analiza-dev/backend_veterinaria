import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { HistorialClinico } from 'src/historial_clinico/entities/historial_clinico.entity';
import { Exclude } from 'class-transformer';
import { HistorialDocumento } from 'src/historial_documentos/entities/historial_documento.entity';

@Entity('detalles_historial_clinico')
export class HistorialDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HistorialClinico, (historial) => historial.detalles)
  @JoinColumn({ name: 'historial_id' })
  @Exclude({ toPlainOnly: true })
  historial: HistorialClinico;

  @ManyToOne(() => SubServicio, { nullable: true })
  @JoinColumn({ name: 'sub_servicio_id' })
  subServicio?: SubServicio;

  @Column({ type: 'text', nullable: true, default: 'N/D' })
  diagnostico?: string;

  @Column({ type: 'text', nullable: true, default: 'N/D' })
  tratamiento?: string;

  @Column({ type: 'text', nullable: true, default: 'N/D' })
  observaciones?: string;

  @OneToMany(() => HistorialDocumento, (doc) => doc.detalle, { cascade: true })
  documentos: HistorialDocumento[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
