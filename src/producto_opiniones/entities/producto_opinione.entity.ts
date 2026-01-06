import { Max, Min } from 'class-validator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('producto_opiniones')
@Unique(['cliente', 'producto'])
export class ProductoOpinione {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Min(1)
  @Max(5)
  rating: number;

  @Column({ type: 'text', nullable: true })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ default: false })
  compra_verificada: boolean;

  @ManyToOne(() => Cliente, (cliente) => cliente.opiniones, {
    eager: true,
  })
  cliente: Cliente;

  @ManyToOne(() => SubServicio, (producto) => producto.opiniones, {
    onDelete: 'CASCADE',
  })
  producto: SubServicio;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
