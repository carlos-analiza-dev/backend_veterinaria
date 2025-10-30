import { NotaCredito } from 'src/nota_credito/entities/nota_credito.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('detalles_notas_credito')
export class DetallesNotaCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => NotaCredito, (notaCredito) => notaCredito.detalles)
  @JoinColumn({ name: 'nota_id' })
  notaCredito: NotaCredito;

  @Column({ name: 'nota_id' })
  nota_id: string;

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'producto_id' })
  producto: SubServicio;

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
