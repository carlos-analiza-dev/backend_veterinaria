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
  CREAR_ESCALA = 'CREAR ESCALA PARA AGROSERVICIO',
  ACTUALIZAR_ESCALA = 'ACTUALIZAR ESCALA PARA AGROSERVICIO',
  CREAR_COMPRA_INSUMO = 'CREAR COMPRA INSUMO PARA AGROSERVICIO',
  ACTUALIZAR_COMPRA_INSUMO = 'ACTUALIZAR COMPRA INSUMO PARA AGROSERVICIO',
  CREAR_CONSUMO_INSUMO = 'CREAR CONSUMO DE INSUMO PARA AGROSERVICIO',
  ACTUALIZAR_CONSUMO_INSUMO = 'ACTUALIZAR CONSUMO DE INSUMO PARA AGROSERVICIO',
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
