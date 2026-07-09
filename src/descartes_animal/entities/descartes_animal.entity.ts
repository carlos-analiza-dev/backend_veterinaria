import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('descartes_animal')
export class DescartesAnimal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimalFinca, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animalId' })
  animal: AnimalFinca;

  @Column()
  animalId: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'varchar', length: 200 })
  razon_descarte: string;

  @Column({ type: 'date' })
  fecha_descarte: Date;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'registradoPorId' })
  registrado_por: Cliente;

  @Column({ nullable: true })
  registradoPorId: string;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;
}
