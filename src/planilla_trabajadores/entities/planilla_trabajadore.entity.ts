import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { DetallePlanillaTrabajadore } from 'src/detalle_planilla_trabajadores/entities/detalle_planilla_trabajadore.entity';
import {
  EstadoPlanilla,
  TipoPeriodoPago,
} from 'src/interfaces/planillas.enums';
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

@Entity('planillas_trabajadores')
export class PlanillaTrabajadore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: TipoPeriodoPago,
    default: TipoPeriodoPago.MENSUAL,
  })
  tipoPeriodo: TipoPeriodoPago;

  @Column('int', { default: 15 })
  diasPeriodo: number;

  @Column('date')
  fechaInicio: Date;

  @Column('date')
  fechaFin: Date;

  @Column('date')
  fechaPago: Date;

  @Column({
    type: 'enum',
    enum: EstadoPlanilla,
    default: EstadoPlanilla.BORRADOR,
  })
  estado: EstadoPlanilla;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSalarios: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalHorasExtras: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalBonificaciones: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalDeducciones: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalNeto: number;

  @Column('text', { nullable: true })
  observaciones: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.planillas, { eager: true })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Cliente;

  @Column()
  propietarioId: string;

  @OneToMany(() => DetallePlanillaTrabajadore, (detalle) => detalle.planilla, {
    cascade: true,
  })
  detalles: DetallePlanillaTrabajadore[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
