import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { CategoriaProducto } from 'src/interfaces/categoria-productos';
import { ProductoVenta } from 'src/producto_ventas/entities/producto_venta.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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
}
