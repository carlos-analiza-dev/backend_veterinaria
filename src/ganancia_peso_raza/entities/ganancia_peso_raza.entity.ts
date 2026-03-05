import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';

@Entity('ganancia_peso_raza')
@Unique(['cliente', 'raza'])
export class GananciaPesoRaza {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.gananciasPesoRaza, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;

  @ManyToOne(() => RazaAnimal, (raza) => raza.gananciasPesoRaza, {
    onDelete: 'CASCADE',
    eager: true,
  })
  raza: RazaAnimal;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  gananciaMinima: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  gananciaMaxima: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
