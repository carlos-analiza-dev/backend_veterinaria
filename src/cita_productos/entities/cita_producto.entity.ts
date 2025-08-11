import { Cita } from 'src/citas/entities/cita.entity';
import { ProductosAgroservicio } from 'src/productos_agroservicio/entities/productos_agroservicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cita_productos')
export class CitaProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cita, (cita) => cita.productosUsados)
  @JoinColumn({ name: 'citaId' })
  cita: Cita;

  @ManyToOne(() => ProductosAgroservicio, (insumo) => insumo.citas, {
    eager: true,
  })
  @JoinColumn({ name: 'productoId' })
  producto: ProductosAgroservicio;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;
}
