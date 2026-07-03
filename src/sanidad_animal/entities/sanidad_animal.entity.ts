import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sanidad_animal')
export class SanidadAnimal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimalFinca, { eager: true })
  @JoinColumn({ name: 'animalId' })
  animal: AnimalFinca;

  @Column({ nullable: false })
  animalId: string;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Cliente;

  @Column({ nullable: false })
  propietarioId: string;

  //CAMPOS GLOBALES

  @Column({ type: 'varchar', length: 100 })
  tipo_servicio: string;

  @Column({ type: 'varchar', length: 100 })
  responsable: string;

  @Column({ type: 'date' })
  fecha_evento: Date;

  @Column({ type: 'date' })
  proxima_fecha_evento: Date;

  @Column({ type: 'varchar', nullable: true, default: 'N/D' })
  observaciones: string;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  costo_base: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  precio_referencia: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  margen_referencia: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  costo_real: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  valor_estimado: number;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  tratamiento_aplicado: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  motivo: string;
  /* ---------------------------------------------------------- */
  //VACUNAS
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  vacuna_aplicada: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  via_aplicacion_vacuna: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  dosis_tratamiento: string;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  dosis: number;
  /* --------------------------------------------------- */
  //DESPARACITACION
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  tipo_desparasitacion: string;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  peso_usado: number;
  /* --------------------------------------------------- */
  //UBRE
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  prueba_evento: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  cuarto_afectado: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  dias_retiro_leche: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  litros_diarios_actuales: number;
  /* --------------------------------------------------- */
  //PEZUÑAS
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  tipo_atencion: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  grado_cojera: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  miembro_afectado: string;
  /* --------------------------------------------------- */
  //LIMPIEZA GENERAL DE TODAS LAS ESPECIES
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  potrero_corral_area: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  actividad: string;

  @Column({ type: 'json', nullable: true })
  dias_descanso: string[];

  @Column({ type: 'json', nullable: true })
  producto_maquinaria_utilizada: string[];

  @Column({ type: 'decimal', nullable: true, default: 0 })
  carga_animal: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  costo_producto_maquinaria: number;
  /* --------------------------------------------------- */
  //ESQUILA PARA OVEJAS
  @Column({ type: 'decimal', nullable: true, default: 0 })
  peso_lana: number;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  calidad_lana: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  color_lana: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  responsable_esquila: string;
  /* --------------------------------------------------- */

  //BAÑOS PARA OVEJAS
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  motivo_baño: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  tiempo_baño: number;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  hallazgos_piel: string;
  /* --------------------------------------------------- */

  //ODONTOLIGA EQUINOS
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  procedimiento: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  hallazgos: string;
  /* --------------------------------------------------- */
  //CASCOS EQUINOS
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  tipo: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  herrador: string;
  /* --------------------------------------------------- */
  //LESIONES EQUINOS
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  tipo_lesion: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  zona_afectada: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  severidad: string;
  /* --------------------------------------------------- */

  //CONDICION CORPORAL EQUINOS
  @Column({ type: 'decimal', nullable: true, default: 0 })
  peso_estimado: number;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  condicion_corporal: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  cambio_dieta: string;
  /* ---------------------------------------------------------- */

  //BAJA/MORTALIDAD EN PORCINOS y AVES
  @Column({ type: 'int', default: 0 })
  cantidad_bajas: number;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  causa_baja_probable: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  accion_correctiva: string;
  /* ---------------------------------------------------------- */

  //CAMA/NIDO EN AVES
  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  tipo_accion: string;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  material_utilizado: string;

  @Column({ type: 'decimal', default: 0 })
  cantidad_usada: number;
  /* ---------------------------------------------------------- */

  //PRODUCCION SANITARIA AVES
  @Column({ type: 'int', default: 0 })
  huevos_diarios: number;

  @Column({ type: 'int', default: 0 })
  huevos_rotos: number;

  @Column({ type: 'int', default: 0 })
  porcentaje_postura: number;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  calidad_huevo: string;
  /* ---------------------------------------------------------- */

  //CALIDAD AGUA PECES
  @Column({ type: 'decimal', default: 0 })
  temperatura: number;

  @Column({ type: 'decimal', default: 0 })
  oxigeno: number;

  @Column({ type: 'decimal', default: 0 })
  ph: number;

  @Column({ type: 'decimal', default: 0 })
  amonio: number;

  @Column({ type: 'decimal', default: 0 })
  nitritos: number;
  /* ---------------------------------------------------------- */

  //RECAMBIO AGUA PECES
  @Column({ type: 'int', default: 0 })
  porcentaje_recambio: number;

  @Column({ type: 'decimal', default: 0 })
  volumen_estimado: number;
  /* ---------------------------------------------------------- */

  //MUESTREO PECES
  @Column({ type: 'decimal', default: 0 })
  cantidad_muestreo: number;

  @Column({ type: 'decimal', default: 0 })
  peso_promedio: number;

  @Column({ type: 'decimal', default: 0 })
  talla_promedio: number;

  @Column({ type: 'decimal', default: 0 })
  biomasa_estimada: number;

  @Column({ type: 'varchar', length: 100, default: 'N/D' })
  etapa_peces: string;
}
