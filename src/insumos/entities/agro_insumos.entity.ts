import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UnidadVenta } from './insumo.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';

@Entity('agro_insumos')
export class AgroInsumos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo: number;

  @Column({
    type: 'enum',
    enum: UnidadVenta,
    default: UnidadVenta.UNIDAD,
  })
  unidad_venta: UnidadVenta;

  @Column({ default: true })
  disponible: boolean;

  @ManyToOne(() => Marca, (marca) => marca.agro_insumos, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca | null;

  @ManyToOne(() => AgroProveedore, (proveedor) => proveedor.agro_insumos, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: AgroProveedore | null;

  @ManyToOne(() => DatosAgroservicio, (agro) => agro.agro_insumos, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
