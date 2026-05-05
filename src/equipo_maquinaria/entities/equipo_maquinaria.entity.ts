import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { EstadoMaquinaria } from 'src/interfaces/maquinaria/maquinaria.enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('equipo_maquinaria')
export class EquipoMaquinaria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 100, nullable: true })
  codigoInterno: string;

  @Column({ length: 100 })
  tipo: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  modelo: string;

  @Column({ nullable: true })
  numeroSerie: string;

  @Column({ type: 'date', nullable: true })
  fechaCompra: string;

  @Column({ type: 'decimal', nullable: true })
  costoCompra: number;

  @Column({
    type: 'enum',
    enum: EstadoMaquinaria,
    default: EstadoMaquinaria.ACTIVO,
  })
  estado: EstadoMaquinaria;

  @Column({ type: 'decimal', default: 0 })
  horasUso: number;

  @Column({ type: 'decimal', nullable: true })
  vidaUtilHoras: number;

  @Column({ nullable: true })
  fincaId: string;

  @ManyToOne(() => FincasGanadero, (finca) => finca.id)
  @JoinColumn({ name: 'fincaId' })
  finca: FincasGanadero;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
