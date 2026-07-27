import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgroMovimientosInventario } from './agro-movimientos-inventario.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

export enum AccionMovimiento {
  CREAR = 'MOVIMIENTO REALIZADO',
}

@Entity('auditoria_movimientos_inventario_agro')
export class AuditoriaMovimientosAgro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroMovimientosInventario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movimientoId' })
  movimiento: AgroMovimientosInventario;

  @Column()
  movimientoId: string;

  @Column({
    type: 'enum',
    enum: AccionMovimiento,
  })
  accion: AccionMovimiento;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
