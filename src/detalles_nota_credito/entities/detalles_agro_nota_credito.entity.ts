import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';
import { AgroNotaCredito } from 'src/nota_credito/entities/nota_agro_credito.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('detalles_notas_credito_agro')
export class DetallesAgroNotaCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroNotaCredito, (notaCredito) => notaCredito.detalles)
  @JoinColumn({ name: 'nota_id' })
  notaCredito: AgroNotaCredito;

  @Column({ name: 'nota_id' })
  nota_id: string;

  @ManyToOne(() => AgroProducto)
  @JoinColumn({ name: 'producto_id' })
  producto: AgroProducto;

  @Column({ name: 'producto_id' })
  producto_id: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({
    name: 'monto_devuelto',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  montoDevuelto: number;
}
