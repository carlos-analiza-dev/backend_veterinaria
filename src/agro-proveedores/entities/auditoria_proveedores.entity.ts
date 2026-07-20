import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AccionProveedor {
  CREAR = 'CREAR',
  ACTUALIZAR = 'ACTUALIZAR',
  DESACTIVAR = 'DESACTIVAR',
}

@Entity('auditoria_proveedores')
export class AuditoriaProveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroProveedore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: AgroProveedore;

  @Column()
  proveedorId: string;

  @Column({
    type: 'enum',
    enum: AccionProveedor,
  })
  accion: AccionProveedor;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
