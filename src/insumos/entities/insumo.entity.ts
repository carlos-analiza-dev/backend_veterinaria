import { Inventario } from 'src/inventario/entities/inventario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column()
  tipo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column()
  unidadMedida: string;

  @Column({ default: true })
  esInsumo: boolean;

  @Column({ default: true })
  disponible: boolean;

  @OneToOne(() => Inventario, (inventario) => inventario.insumo, {
    eager: true,
  })
  inventario: Inventario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
