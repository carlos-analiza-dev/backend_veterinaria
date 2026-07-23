import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgroComprasProducto } from './agro-compras-producto.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

export enum AccionCompra {
  CREAR = 'COMPRA CREADO',
  ACTUALIZAR = 'COMPRA ACTUALIZADO',
  DESACTIVAR = 'COMPRA DESACTIVADO',
}

@Entity('auditoria_compras_productos')
export class AuditoriaCompra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroComprasProducto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compraId' })
  compra: AgroComprasProducto;

  @Column()
  compraId: string;

  @Column({
    type: 'enum',
    enum: AccionCompra,
  })
  accion: AccionCompra;

  @ManyToOne(() => EmpleadosAgro)
  @JoinColumn({ name: 'empleadoId' })
  empleado: EmpleadosAgro;

  @Column()
  empleadoId: string;

  @CreateDateColumn()
  fecha: Date;
}
