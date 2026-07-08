import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { SanidadAnimal } from './sanidad_animal.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Entity('historial_fechas_sanidad')
export class HistorialFechasSanidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SanidadAnimal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sanidadId' })
  sanidad: SanidadAnimal;

  @Column({ nullable: false })
  sanidadId: string;

  @Column({ type: 'date' })
  fecha_anterior: Date;

  @Column({ type: 'date' })
  fecha_nueva: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo_cambio: string;

  @Column({ type: 'varchar', length: 100 })
  tipo_cambio: string;

  @Column({ type: 'varchar', length: 100 })
  usuario: string;

  @Column({ type: 'int', default: 0 })
  dias_diferencia: number;

  @CreateDateColumn()
  fecha_cambio: Date;

  @Column({ nullable: true })
  actualizadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'actualizadoPorId' })
  actualizado_por: Cliente;
}
