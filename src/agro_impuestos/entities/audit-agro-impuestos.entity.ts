import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgroImpuesto } from './agro_impuesto.entity';

export enum AccionImpuestos {
  CREAR = 'IMPUESTO CREADO',
  ACTUALIZAR = 'IMPUESTO ACTUALIZADO',
}

@Entity('auditoria_agro_impuestos')
export class AuditoriaImpuesto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroImpuesto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'impuestoId' })
  impuesto: AgroImpuesto;

  @Column()
  impuestoId: string;

  @Column({
    type: 'enum',
    enum: AccionImpuestos,
  })
  accion: AccionImpuestos;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
