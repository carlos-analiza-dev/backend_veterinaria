import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmpleadosAgro } from './empleados-agro.entity';

export enum AccionEmpleado {
  CREAR_DESCUENTO = 'CREAR DESCUENTO CLIENTES',
  ACTUALIZAR_DESCUENTO = 'ACTUALIZAR DESCUENTO CLIENTES',
  CREAR_CLIENTE = 'CREAR CLIENTE PARA AGROSERVICIO',
  ACTUALIZAR_CLIENTE = 'ACTUALIZAR CLIENTE PARA AGROSERVICIO',
  CREAR_INSUMO = 'CREAR INSUMO PARA AGROSERVICIO',
  ACTUALIZAR_INSUMO = 'ACTUALIZAR INSUMO PARA AGROSERVICIO',
}

@Entity('auditoria_empleados')
export class AuditoriaEmpleados {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: AccionEmpleado,
  })
  accion: AccionEmpleado;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
