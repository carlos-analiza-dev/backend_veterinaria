import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('configuraciones_trabajador')
@Unique(['trabajadorId', 'activo'])
export class ConfiguracionTrabajadore {
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
  fechaContratacion: Date;

  @Column('text', { nullable: true })
  cargo: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salarioDiario: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  factorHoraExtraDiurnas: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  factorHoraExtraNocturnas: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  factorHoraExtraFestivas: number;

  @Column('int', { default: 7 })
  horasJornadaSemanal: number;

  @Column('int', { default: 5 })
  diasTrabajadosSemanal: number;

  @Column('json', { nullable: true })
  bonificacionesFijas: {
    concepto: string;
    montoMensual: number;
  }[];

  @Column('json', { nullable: true })
  deduccionesFijas: {
    concepto: string;
    montoMensual: number;
  }[];

  @Column('boolean', { default: true })
  activo: boolean;

  @Column('date', { nullable: true })
  fechaBaja: Date;

  @Column('text', { nullable: true })
  motivoBaja: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
