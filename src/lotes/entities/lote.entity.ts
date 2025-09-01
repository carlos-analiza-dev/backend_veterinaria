import { User } from 'src/auth/entities/auth.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoLote {
  ACTIVO = 'ACTIVO',
  VENCIDO = 'VENCIDO',
  AGOTADO = 'AGOTADO',
  RETIRADO = 'RETIRADO',
}

export enum UnidadMedida {
  KILOGRAMOS = 'KG',
  GRAMOS = 'G',
  LITROS = 'L',
  MILILITROS = 'ML',
  UNIDADES = 'UNIDADES',
  CAJAS = 'CAJAS',
  SACOS = 'SACOS',
}

export enum TipoMoneda {
  LEMPIRA = 'HNL',
  DOLAR = 'USD',
  EURO = 'EUR',
}

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  numero_lote_color: string;

  @Column({ type: 'varchar', length: 100 })
  orden_compra_id: string;

  @Column({ type: 'date' })
  fecha_compra: Date;

  @Column({ type: 'date', nullable: true })
  fecha_vencimiento: Date;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  cantidad_total: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  cantidad_disponible: number;

  @Column({
    type: 'enum',
    enum: UnidadMedida,
    default: UnidadMedida.UNIDADES,
  })
  unidad_medida: UnidadMedida;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  costo_unitario: number;

  @Column({
    type: 'enum',
    enum: TipoMoneda,
    default: TipoMoneda.LEMPIRA,
  })
  moneda: TipoMoneda;

  @Column({ type: 'varchar', length: 200, nullable: true })
  ubicacion: string;

  @Column({
    type: 'enum',
    enum: EstadoLote,
    default: EstadoLote.ACTIVO,
  })
  estatus: EstadoLote;

  @Column({ type: 'varchar', length: 100, nullable: true })
  numero_registro_sanitario: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Insumo, { eager: true })
  producto: Insumo;

  @ManyToOne(() => Proveedor, { eager: true })
  proveedor: Proveedor;

  // Campos de auditoría
  @ManyToOne(() => User, { eager: true })
  created_by: User;

  @ManyToOne(() => User, { eager: true })
  updated_by: User;
}