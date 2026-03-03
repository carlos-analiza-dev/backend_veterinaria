import { UnidadMedida } from 'src/interfaces/unidad-medida';
import { ProductosGanaderia } from 'src/productos_ganaderia/entities/productos_ganaderia.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('producto_ventas')
export class ProductoVenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UnidadMedida,
  })
  unidadMedida: UnidadMedida;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  precio: number;

  @Column({ default: 'L' })
  moneda: string;

  @ManyToOne(() => ProductosGanaderia, (producto) => producto.ventas, {
    onDelete: 'CASCADE',
  })
  producto: ProductosGanaderia;
}
