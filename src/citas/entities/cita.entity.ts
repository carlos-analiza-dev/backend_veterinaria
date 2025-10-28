import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { CitaInsumo } from 'src/cita_insumos/entities/cita_insumo.entity';
import { CitaProducto } from 'src/cita_productos/entities/cita_producto.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { EstadoCita } from 'src/interfaces/estados_citas';
import { Medico } from 'src/medicos/entities/medico.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  @ManyToOne(() => Medico, (medico) => medico.citas)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @ManyToMany(() => AnimalFinca, { eager: true })
  @JoinTable({
    name: 'cita_animales',
    joinColumn: { name: 'citaId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'animalId', referencedColumnName: 'id' },
  })
  animales: AnimalFinca[];

  @ManyToOne(() => FincasGanadero, { eager: true })
  @JoinColumn({ name: 'fincaId' })
  finca: FincasGanadero;

  @OneToMany(() => CitaInsumo, (citaInsumo) => citaInsumo.cita, { eager: true })
  insumosUsados: CitaInsumo[];

  @OneToMany(() => CitaProducto, (citaProducto) => citaProducto.cita, {
    eager: true,
  })
  productosUsados: CitaProducto[];

  @ManyToOne(() => SubServicio)
  @JoinColumn({ name: 'subServicioId' })
  subServicio: SubServicio;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int', default: 1 })
  cantidadAnimales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPagar: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalFinal: number;

  @Column({ type: 'int', default: 1 })
  duracion: number;

  @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.PENDIENTE })
  estado: EstadoCita;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  generarCodigo() {
    const año = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.codigo = `CITA-${año}-${random}`;
  }
}
