import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PlanillaTrabajadore } from 'src/planilla_trabajadores/entities/planilla_trabajadore.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('detalles_planilla_trabajadores')
export class DetallePlanillaTrabajadore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlanillaTrabajadore, (planilla) => planilla.detalles)
  @JoinColumn({ name: 'planillaId' })
  planilla: PlanillaTrabajadore;

  @Column()
  planillaId: string;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ name: 'trabajadorId' })
  trabajador: Cliente;

  @Column()
  trabajadorId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salarioDiario: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorHoraExtraDiurna: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorHoraExtraNocturna: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorHoraExtraFestiva: number;

  @Column('int', { default: 0 })
  diasTrabajados: number;

  @Column('int', { default: 0 })
  diasDescanso: number;

  @Column('int', { default: 0 })
  diasVacaciones: number;

  @Column('int', { default: 0 })
  diasEnfermedad: number;

  @Column('int', { default: 0 })
  diasPermiso: number;

  @Column('int', { default: 0 })
  ausenciasInjustificadas: number;

  @Column('decimal', { precision: 5, scale: 1, default: 0 })
  horasExtraDiurnas: number;

  @Column('decimal', { precision: 5, scale: 1, default: 0 })
  horasExtraNocturnas: number;

  @Column('decimal', { precision: 5, scale: 1, default: 0 })
  horasExtraFestivas: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalHorasExtras: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  bonificaciones: number;

  @Column('json', { nullable: true })
  desgloseBonificaciones: {
    concepto: string;
    monto: number;
  }[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deducciones: number;

  @Column('json', { nullable: true })
  desgloseDeducciones: {
    concepto: string;
    monto: number;
  }[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  prestamos: number;

  @Column('json', { nullable: true })
  desglosePrestamos: {
    fecha: Date;
    monto: number;
    abono: number;
    saldoPendiente: number;
  }[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  salarioBase: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalDevengado: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalDeduccionesAplicadas: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAPagar: number;

  @Column('boolean', { default: false })
  pagado: boolean;

  @Column('timestamp', { nullable: true })
  fechaPago: Date;

  @Column('text', { nullable: true })
  metodoPago: string;

  @Column('text', { nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
