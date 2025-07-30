import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum TipoProduccionGanadera {
  LECHE = 'Leche',
  CARNE_BOVINA = 'Carne Bovina',
  CARNE_PORCINA = 'Carne Porcina',
  CARNE_AVE = 'Carne de Ave',
  HUEVO = 'Huevo',
  CARNE_CAPRINO = 'Carne Caprino',
  GANADO_PIE = 'Ganado en pie',
  OTRO = 'Otro',
}

export enum UnidadProduccionLeche {
  LITROS = 'Litros',
  LIBRAS = 'Libras',
  BOTELLAS = 'Botellas',
}

export enum CalidadHuevo {
  A = 'A',
  AA = 'AA',
  SUCIO = 'Sucio',
}

@Entity('produccion_ganadera')
export class ProduccionGanadera {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TipoProduccionGanadera,
    array: true,
    default: [],
  })
  tiposProduccion: TipoProduccionGanadera[];

  // Campos para producción de leche
  @Column({ type: 'decimal', nullable: true })
  produccionLecheCantidad: number;

  @Column({ type: 'enum', enum: UnidadProduccionLeche, nullable: true })
  produccionLecheUnidad: UnidadProduccionLeche;

  @Column({ type: 'int', nullable: true })
  vacasOrdeño: number;

  @Column({ type: 'int', nullable: true })
  vacasSecas: number;

  @Column({ type: 'int', nullable: true })
  terneros: number;

  @Column({ type: 'date', nullable: true })
  fechaPromedioSecado: Date;

  // Campos para carne bovina
  @Column({ type: 'int', nullable: true })
  cabezasEngordeBovino: number;

  @Column({ type: 'decimal', nullable: true })
  kilosSacrificioBovino: number;

  // Campos para carne porcina
  @Column({ type: 'int', nullable: true })
  cerdosEngorde: number;

  @Column({ type: 'decimal', nullable: true })
  pesoPromedioCerdo: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  edadSacrificioProcino: string;

  // Campos para carne de ave
  @Column({ type: 'int', nullable: true })
  mortalidadLoteAves: number;

  // Campos para huevos
  @Column({ type: 'int', nullable: true })
  huevosPorDia: number;

  @Column({ type: 'int', nullable: true })
  gallinasPonedoras: number;

  @Column({ type: 'enum', enum: CalidadHuevo, nullable: true })
  calidadHuevo: CalidadHuevo;

  // Campos para carne caprina
  @Column({ type: 'int', nullable: true })
  animalesEngordeCaprino: number;

  @Column({ type: 'decimal', nullable: true })
  pesoPromedioCaprino: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  edadSacrificioCaprino: string;

  // Campos para ganado en pie
  @Column({ type: 'int', nullable: true })
  animalesDisponibles: number;

  @Column({ type: 'decimal', nullable: true })
  pesoPromedioCabeza: number;

  // Campos para "Otro"
  @Column({ type: 'varchar', length: 100, nullable: true })
  otroProductoNombre: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  otroProductoUnidadMedida: string;

  @Column({ type: 'decimal', nullable: true })
  otroProductoProduccionMensual: number;

  // Relación con producción finca
  @OneToOne(() => ProduccionFinca, (produccion) => produccion.ganadera)
  @JoinColumn({ name: 'produccionFincaId' })
  produccionFinca: ProduccionFinca;
}
