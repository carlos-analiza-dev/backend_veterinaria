import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AccionesFactura {
  CREAR = 'FACTURA CREADO',
  ACTUALIZAR = 'FACTURA ACTUALIZADO',
  CREAR_RANGO = 'RANGO FACTURA CREADO',
  EDITAR_RANGO = 'RANGO FACTURA EDITADO',
}

@Entity('auditoria_agro_facturacion')
export class AuditoriaAgroFacturacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: AccionesFactura,
  })
  accion: AccionesFactura;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
