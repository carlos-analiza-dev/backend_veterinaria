import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgroFacturacion } from './agro_facturacion.entity';

export enum AccionFacturacion {
  CREAR = 'FACTURA CREADA',
  ACTUALIZAR = 'FACTURA ACTUALIZADA',
}

@Entity('auditoria_facturacion')
export class AuditoriaFacturacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroFacturacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facturaId' })
  factura: AgroFacturacion;

  @Column()
  facturaId: string;

  @Column({
    type: 'enum',
    enum: AccionFacturacion,
  })
  accion: AccionFacturacion;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
