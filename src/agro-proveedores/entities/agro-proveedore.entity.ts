import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoPagoProveedor {
  CONTADO = 'CONTADO',
  CREDITO = 'CREDITO',
}

export enum TipoEscala {
  ESCALA = 'ESCALA',
  DESCUENTO = 'DESUENTO',
}

@Entity('agro-proveedores')
export class AgroProveedore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  nit_rtn: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nrc: string;

  @Column({ type: 'varchar', length: 200 })
  nombre_legal: string;

  @Column({ type: 'text' })
  complemento_direccion: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo: string;

  @Column({ type: 'varchar', length: 150 })
  nombre_contacto: string;

  @Column({ type: 'int', nullable: true })
  plazo?: number;

  @Column({
    type: 'enum',
    enum: TipoEscala,
    default: TipoEscala.ESCALA,
  })
  tipo_escala: TipoEscala;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: TipoPagoProveedor,
    default: TipoPagoProveedor.CONTADO,
  })
  tipo_pago_default: TipoPagoProveedor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => DatosAgroservicio, (agro) => agro.proveedores, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;

  @ManyToOne(() => Pai, { eager: false })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, { eager: false })
  departamento: DepartamentosPai;

  @ManyToOne(() => MunicipiosDepartamentosPai, { eager: false })
  municipio: MunicipiosDepartamentosPai;
}
