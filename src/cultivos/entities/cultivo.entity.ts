import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { TipoCultivoEnum } from 'src/interfaces/cultivos/tipo-cultivo.enums';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cultivos')
export class Cultivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre_cultivo: string;

  @Column({ nullable: true })
  variedad: string;

  @Column({ type: 'enum', enum: TipoCultivoEnum })
  tipo_cultivo: TipoCultivoEnum;

  @Column({ type: 'decimal', default: 0 })
  area_sembrada: number;

  @Column({ nullable: true })
  unidad_medida: string;

  @Column({ type: 'date', nullable: true })
  fecha_siembra: Date;

  @Column({ type: 'date', nullable: true })
  fecha_cosecha_estimada: Date;

  @Column({ nullable: true })
  temporada: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => FincasGanadero, (finca) => finca.cultivos)
  finca: FincasGanadero;

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
}
