import { Pai } from 'src/pais/entities/pai.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('descuentos_clientes')
export class DescuentosCliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje: number;

  @ManyToOne(() => Pai, (pais) => pais.descuentos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'pais_id' })
  pais: Pai;
}
