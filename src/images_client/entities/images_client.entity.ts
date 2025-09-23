import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('images_clientes')
export class ImagesClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.profileImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
