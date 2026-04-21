import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jornada_trabajadores')
export class JornadaTrabajadore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ name: 'trabajadorId' })
  trabajador: Cliente;

  @Column()
  trabajadorId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'propietarioId' })
  propietario: Cliente;

  @Column()
  propietarioId: string;

  @Column('date')
  fecha: Date;

  @Column('boolean', { default: true })
  trabajo: boolean;

  @Column('text', { nullable: true })
  laborRealizada: string;

  @Column('decimal', { precision: 5, scale: 1, default: 0 })
  horasExtrasDiurnas: number;

  @Column('decimal', { precision: 5, scale: 1, default: 0 })
  horasExtrasNocturnas: number;

  @Column('decimal', { precision: 5, scale: 1, default: 0 })
  horasExtrasFestivas: number;

  @Column('text', { nullable: true })
  observaciones: string;

  @Column('boolean', { default: false })
  sincronizado: boolean;

  @Column('timestamp', { nullable: true })
  fechaSincronizacion: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
