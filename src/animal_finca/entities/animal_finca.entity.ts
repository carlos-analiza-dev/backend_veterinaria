import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ImagesAminale } from 'src/images_aminales/entities/images_aminale.entity';
import {
  PurezaEnum,
  TipoAve,
  TipoReproduccionEnum,
  UsoEquinoEnum,
} from 'src/interfaces/animales/animales-enums';
import { PartoAnimal } from 'src/parto_animal/entities/parto_animal.entity';
import { PesoHistorial } from 'src/peso_historial/entities/peso_historial.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EtapaPez } from '../dto/create-peces.dto';

@Entity('animal_finca')
export class AnimalFinca {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EspecieAnimal, { eager: true })
  especie: EspecieAnimal;

  @Column({ type: 'varchar', length: 100, nullable: true, default: 'N/D' })
  sexo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_animal: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  identificador: string;

  @Column({
    type: 'enum',
    enum: TipoReproduccionEnum,
    default: TipoReproduccionEnum.NATURAL,
  })
  tipo_reproduccion: TipoReproduccionEnum;

  @Column({
    type: 'enum',
    enum: PurezaEnum,
    default: PurezaEnum.NO_DEFINIDA,
  })
  pureza: PurezaEnum;

  @ManyToMany(() => RazaAnimal, { eager: true })
  @JoinTable()
  razas: RazaAnimal[];

  @Column({ type: 'int', nullable: true })
  edad_promedio: number;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'jsonb', nullable: true })
  tipo_alimentacion: {
    alimento: string;
    origen: 'comprado' | 'producido' | 'comprado y producido';
    porcentaje_comprado?: number;
    porcentaje_producido?: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  complementos: { complemento: string }[];

  @Column({ type: 'varchar', length: 100, default: 'Sin medicamento' })
  medicamento: string;

  @Column({ type: 'varchar', nullable: true })
  produccion: string;

  @Column({ type: 'varchar', nullable: true })
  tipo_produccion: string;

  @Column({ type: 'bool', default: false })
  animal_muerte: boolean;

  @Column({ type: 'varchar', default: 'N/D' })
  razon_muerte: string;

  @Column({ type: 'boolean', default: false })
  compra_animal: boolean;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  nombre_criador_origen_animal: string;

  @Column({ type: 'bool', default: false })
  animal_vendido: boolean;

  @ManyToOne(() => AnimalFinca, { nullable: true })
  @JoinColumn({ name: 'padreId' })
  padre: AnimalFinca;

  @Column({ nullable: true })
  padreId: string;

  @ManyToOne(() => AnimalFinca, { nullable: true })
  @JoinColumn({ name: 'madreId' })
  madre: AnimalFinca;

  @Column({ nullable: true })
  madreId: string;

  /* DATOS PADRE */

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  nombre_padre?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  arete_padre: string;

  @ManyToMany(() => RazaAnimal, { cascade: true, eager: true })
  @JoinTable({
    name: 'animal_finca_razas_padre',
  })
  razas_padre: RazaAnimal[];

  @Column({
    type: 'enum',
    enum: PurezaEnum,
    default: PurezaEnum.NO_DEFINIDA,
  })
  pureza_padre: PurezaEnum;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_criador_padre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_propietario_padre: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  nombre_finca_origen_padre: string;

  /* DATOS MADRE */
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  nombre_madre?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  arete_madre: string;

  @ManyToMany(() => RazaAnimal, { cascade: true, eager: true })
  @JoinTable({
    name: 'animal_finca_razas_madre',
  })
  razas_madre: RazaAnimal[];

  @Column({
    type: 'enum',
    enum: PurezaEnum,
    default: PurezaEnum.NO_DEFINIDA,
  })
  pureza_madre: PurezaEnum;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_criador_madre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_propietario_madre: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  nombre_finca_origen_madre: string;

  @Column({ type: 'int', default: 1 })
  numero_parto_madre: number;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @Column({ nullable: true })
  creadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'creadoPorId' })
  creado_por: Cliente;

  @Column({ nullable: true })
  actualizadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'actualizadoPorId' })
  actualizado_por: Cliente;

  @Column({ nullable: false })
  propietarioId: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.animales, { eager: true })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Cliente;

  @Column({ nullable: true })
  trabajadorId: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.animales, { nullable: true })
  @JoinColumn({ name: 'trabajadorId' })
  trabajador: Cliente;

  @ManyToOne(() => FincasGanadero, (finca) => finca.animales, {
    onDelete: 'CASCADE',
    eager: true,
  })
  finca: FincasGanadero;

  @Column({ type: 'boolean', default: false })
  castrado: boolean;

  @Column({ type: 'boolean', default: false })
  esterelizado: boolean;

  @Column({ type: 'boolean', default: false })
  desparasitado: boolean;

  @Column({ type: 'varchar', length: 100, default: 'Sin vacunas' })
  vacunas: string;

  @Column({ type: 'boolean', default: true })
  lote_activo?: boolean;

  //AVES
  @Column({ type: 'int', nullable: true })
  cantidad_lote: number;

  @Column({ type: 'enum', enum: TipoAve, nullable: true })
  tipo_ave: TipoAve;

  @Column({ type: 'varchar', nullable: true })
  proveedor_aves: string;

  @Column({ type: 'varchar', nullable: true })
  galpon: string;

  @Column({ type: 'int', nullable: true })
  mortalidad_diaria: number;

  @Column({ type: 'varchar', nullable: true })
  consumo_alimento: string;

  @Column({ type: 'varchar', nullable: true })
  consumo_agua: string;

  @Column({ type: 'varchar', nullable: true })
  peso_promedio: string;

  @Column({ type: 'int', nullable: true })
  huevos_diarios: number;

  @Column({ type: 'int', nullable: true })
  huevos_rotos: number;

  @Column({ type: 'varchar', nullable: true })
  calificacion_huevos: string;

  @Column({ type: 'varchar', length: 100, default: 'Sin vacunas' })
  vacunas_lote: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tratamientos: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  porcentaje_postura: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipo_concentrado: string;

  @Column({ type: 'date', nullable: true })
  fecha_postura: Date;
  /* ----------------------------------------- */

  //PECES

  @Column({ type: 'varchar', length: 100, nullable: true })
  estanque_tanque_jaula?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  proveedor_alevines?: string;

  @Column({ type: 'date', nullable: true })
  fecha_siembra?: Date;

  @Column({ type: 'int', nullable: true })
  cantidad_inicial?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  talla_peso_inicial?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  densidad_por_m3_m2?: number;

  @Column({ type: 'int', nullable: true })
  cantidad_actual?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mortalidad_diaria_acum?: string;

  @Column({ type: 'jsonb', nullable: true })
  muestreos?: {
    fecha_muestreo: string;
    peso?: number;
    talla?: number;
  }[];

  @Column({
    type: 'enum',
    enum: EtapaPez,
    nullable: true,
  })
  etapa?: EtapaPez;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso_promedio_pez?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  biomasa_estimada?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  talla_pez?: number;

  @Column({ type: 'date', nullable: true })
  fecha_muestreo_pez?: Date;
  @Column({ type: 'jsonb', nullable: true })
  calidad_agua?: {
    temperatura?: number;
    oxigeno_disuelto?: number;
    ph?: number;
    amonio?: number;
    nitrito?: number;
    turbidez?: number;
    historial_recambios?: {
      fecha_recambio: string;
      porcentaje_recambio?: number;
      volumen_m3?: number;
      motivo?: string;
      responsable?: string;
    }[];
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipo_concentrado_pez?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  proteina_porcentaje?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  racion_diaria?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  consumo_pez?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  conversion_alimenticia?: number;
  @Column({ type: 'jsonb', nullable: true })
  sanidad?: {
    signos_clinicos?: string;
    tratamientos?: string;
    banos_salinidad?: string;
    laboratorio?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  cosecha?: {
    fecha_cosecha: string;
    kilos_cosechados?: number;
    sobrevivencia_porcentaje?: number;
    comprador?: string;
    precio?: number;
  };
  /* ----------------------------------------- */

  //EQUINO
  @Column({
    type: 'enum',
    enum: UsoEquinoEnum,
    nullable: true,
  })
  uso_equino: UsoEquinoEnum;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso_actual: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condicion_corporal: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nivel_entrenamiento: string;

  @Column({ type: 'text', nullable: true })
  resultados_competencias: string;

  @Column({ type: 'text', nullable: true })
  historial_reproductivo: string;

  @Column({ type: 'text', nullable: true })
  registro_genealogico: string;

  @Column({ type: 'text', nullable: true })
  alzada: string;

  @Column({ type: 'text', nullable: true })
  microchip: string;

  @Column({ type: 'text', nullable: true })
  unidad_alzada: string;

  @Column({ type: 'text', nullable: true })
  lesiones: string;

  @Column({ type: 'text', nullable: true })
  alergias: string;

  @Column({ type: 'text', nullable: true })
  odontologia: string;

  @Column({ type: 'text', nullable: true })
  veterinario: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  valor_estimado: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  precio_compra: number;

  @Column({ type: 'boolean', default: false })
  asegurado: boolean;
  /* ----------------------------------------- */

  //CAPTINO
  @Column({ type: 'text', nullable: true })
  mastitis?: string;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  calidad_leche_grasa?: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  calidad_leche_proteina?: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  calidad_leche_celulas?: number;
  @Column({ type: 'text', nullable: true })
  linea_genetica?: string;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  litros_leche_dia?: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  peso_destete?: number;
  @Column({ type: 'text', nullable: true })
  proposito?: string;

  //CAPRINOS Y OVINOS
  @Column({ type: 'text', nullable: true })
  potrero?: string;
  @Column({ type: 'text', nullable: true })
  pezunas?: string;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  peso?: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ganancia_peso?: number;
  @Column({ type: 'boolean', default: false })
  mortalidad?: boolean;

  //OVINO
  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria_edad?: string;
  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo_nacimiento?: string;
  @Column({ type: 'jsonb', nullable: true })
  lana?: {
    fecha_esquila?: Date | string;
    calidad_micras?: number;
    color_lana?: string;
    peso_vellon?: number;
  };
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  peso_nacimiento?: number;
  @Column({ type: 'jsonb', nullable: true })
  historial_esquila?: {
    fecha_esquila: Date | string;
    peso_vellon_kg?: number;
    calidad_clasificacion?: string;
    esquilador_responsable?: string;
    observaciones?: string;
  }[];

  @Column({ type: 'smallint', nullable: true })
  famacha?: number;
  @Column({ type: 'jsonb', nullable: true })
  parasitos?: {
    famacha?: number;
    tratamiento?: string;
    fecha_tratamiento?: Date | string;
    observaciones?: string;
  }[];

  @OneToMany(() => ImagesAminale, (profileImage) => profileImage.animal, {
    eager: true,
  })
  profileImages: ImagesAminale[];

  @OneToMany(() => PesoHistorial, (peso) => peso.animal, {
    cascade: true,
  })
  pesos: PesoHistorial[];

  @OneToMany(() => CelosAnimal, (celo) => celo.animal, {
    cascade: true,
  })
  celos: CelosAnimal[];

  @OneToMany(() => PartoAnimal, (parto) => parto.hembra)
  partos: PartoAnimal[];

  get currentProfileImage(): ImagesAminale | null {
    if (!this.profileImages || this.profileImages.length === 0) return null;

    return this.profileImages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];
  }
}
