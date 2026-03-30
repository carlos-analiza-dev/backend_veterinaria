import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { CategoriaGasto, MetodoPago } from 'src/interfaces/gastos.enums';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Entity('gastos')
export class Gasto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CategoriaGasto,
    nullable: false,
  })
  categoria: CategoriaGasto;

  @ManyToOne(() => FincasGanadero, { nullable: true })
  finca: FincasGanadero;

  @ManyToOne(() => EspecieAnimal, { nullable: true })
  especie: EspecieAnimal;

  @ManyToOne(() => RazaAnimal, { nullable: true })
  raza: RazaAnimal;

  @Column({ type: 'varchar', length: 200 })
  concepto: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monto: number;

  @Column({ type: 'date' })
  fecha_gasto: Date;

  @Column({
    type: 'enum',
    enum: MetodoPago,
    default: MetodoPago.EFECTIVO,
  })
  metodo_pago: MetodoPago;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'registrado_por' })
  registradoPor: Cliente;

  @Column({ name: 'registrado_por', nullable: true })
  registradoPorId: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
