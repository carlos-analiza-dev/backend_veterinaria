import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import {
  MetodoSiembra,
  TipoCultivoEnum,
  TipoSistemaRiego,
  TipoSuelo,
} from 'src/interfaces/cultivos/cultivo.enums';
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

  @Column({ type: 'enum', enum: TipoSuelo })
  tipo_suelo: TipoSuelo;

  @Column({ nullable: true })
  ph_suelo: string;

  @Column({ type: 'enum', enum: MetodoSiembra })
  metodo_siembra: MetodoSiembra;

  @Column({ type: 'enum', enum: TipoSistemaRiego })
  sistema_riego: TipoSistemaRiego;

  @Column({ type: 'decimal', nullable: true })
  produccion_estimada: number;

  @Column({ nullable: true })
  unidad_produccion: string;

  @Column({ type: 'decimal', default: 0 })
  costo_semilla: number;

  @Column({ type: 'decimal', default: 0 })
  costo_fertilizantes: number;

  @Column({ type: 'decimal', default: 0 })
  costo_mano_obra: number;

  @Column({ type: 'decimal', default: 0 })
  otros_costos: number;

  @Column({ type: 'decimal', nullable: true })
  ingreso_estimado: number;

  @Column({ type: 'decimal', nullable: true })
  ganancia_estimada: number;

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
