import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';

@Entity('subcategorias')
export class Subcategoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  codigo: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relación con categoría
  @ManyToOne(() => Categoria, { eager: true })
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  // Campos de auditoría
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'createdById' })
  created_by: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'updatedById' })
  updated_by: User;
}
