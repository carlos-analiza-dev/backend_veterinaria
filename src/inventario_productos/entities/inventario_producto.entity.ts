import { ProductosAgroservicio } from 'src/productos_agroservicio/entities/productos_agroservicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('inventario_productos')
export class InventarioProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ProductosAgroservicio, (producto) => producto.inventario, {
    cascade: true,
  })
  @JoinColumn()
  producto: ProductosAgroservicio;

  @Column({ type: 'int' })
  cantidadDisponible: number;

  @Column({ type: 'int' })
  stockMinimo: number;
}
