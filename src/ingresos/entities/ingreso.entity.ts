import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { MetodoPago } from 'src/interfaces/gastos.enums';
import { CategoriaIngreso } from 'src/interfaces/ingresos.enums';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ingresos')
export class Ingreso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CategoriaIngreso,
    nullable: false,
  })
  categoria: CategoriaIngreso;

  @ManyToOne(() => FincasGanadero)
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
  fecha_ingreso: Date;

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

  @Column({ nullable: true })
  actualizadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'actualizadoPorId' })
  actualizado_por: Cliente;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
