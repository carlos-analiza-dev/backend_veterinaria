import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';

@Entity('taxes')
export class TaxesPai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje: number;

  @ManyToOne(() => Pai, (pais) => pais.taxes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'pais_id' })
  pais: Pai;
}
