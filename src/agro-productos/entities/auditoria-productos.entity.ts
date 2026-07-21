import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgroProducto } from './agro-producto.entity';

export enum AccionProducto {
  CREAR = 'PRODUCTO CREADO',
  ACTUALIZAR = 'PRODUCTO ACTUALIZADO',
  DESACTIVAR = 'PRODUCTO DESACTIVADO',
  SUBIR = 'SUBIO IMAGEN',
}

@Entity('auditoria_productos')
export class AuditoriaProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroProducto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productoId' })
  producto: AgroProducto;

  @Column()
  productoId: string;

  @Column({
    type: 'enum',
    enum: AccionProducto,
  })
  accion: AccionProducto;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
