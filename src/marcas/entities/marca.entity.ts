import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Entity('marcas')
export class Marca {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  pais_origen: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => SubServicio, (producto) => producto.marca)
  productos: SubServicio[];

  // Campos de auditoría
  @ManyToOne(() => User, { eager: true })
  created_by: User;

  @ManyToOne(() => User, { eager: true })
  updated_by: User;
}
