import { User } from 'src/auth/entities/auth.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tipo_producto')
export class TipoProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_market: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Subcategoria)
  @JoinColumn({ name: 'subcategoriaId' })
  sub_categoria: Subcategoria;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'createdById' })
  created_by: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'updatedById' })
  updated_by: User;

  @OneToMany(() => SubServicio, (producto) => producto.tipo_producto)
  productos: SubServicio[];
}
