import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { CategoriaProducto } from 'src/interfaces/categoria-productos';
import { ProductoVenta } from 'src/producto_ventas/entities/producto_venta.entity';
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

@Entity('productos_ganaderia')
export class ProductosGanaderia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({
    type: 'enum',
    enum: CategoriaProducto,
  })
  categoria: CategoriaProducto;

  @ManyToOne(() => Cliente, (user) => user.productos)
  propietario: Cliente;

  @OneToMany(() => ProductoVenta, (venta) => venta.producto, {
    cascade: true,
  })
  ventas: ProductoVenta[];

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @Column({ nullable: true })
  creadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'creadoPorId' })
  creado_por: Cliente;

  @Column({ nullable: true })
  actualizadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'actualizadoPorId' })
  actualizado_por: Cliente;
}
