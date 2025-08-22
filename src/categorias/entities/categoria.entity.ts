import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/auth/entities/auth.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Campos de auditoría
  @ManyToOne(() => User, { eager: false })
  created_by: User;

  @ManyToOne(() => User, { eager: false })
  updated_by: User;

  // Relación con productos (se usará después)
  // @OneToMany(() => Producto, (producto) => producto.categoria)
  // productos: Producto[];
}
