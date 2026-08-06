import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('escalas_agro_insumos')
export class EscalasAgroInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroInsumos)
  @JoinColumn({ name: 'insumoId' })
  insumo: AgroInsumos;

  @ManyToOne(() => AgroProveedore, { eager: false })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: AgroProveedore;

  @ManyToOne(() => DatosAgroservicio, { eager: false })
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;

  @Column({ type: 'int' })
  cantidad_comprada: number;

  @Column({ type: 'int', default: 0 })
  bonificacion: number;

  @Column({ type: 'float' })
  costo: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
