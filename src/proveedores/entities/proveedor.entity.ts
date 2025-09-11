import { User } from 'src/auth/entities/auth.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { DescuentosProducto } from 'src/descuentos_producto/entities/descuentos_producto.entity';
import { EscalasProducto } from 'src/escalas_producto/entities/escalas_producto.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('proveedores')
export class Proveedor {
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
    enum: ['ESCALA', 'DESCUENTO'],
    default: 'ESCALA',
  })
  tipo_escala: 'ESCALA' | 'DESCUENTO';

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: ['CONTADO', 'CREDITO'],
    default: 'CONTADO',
  })
  tipo_pago_default: 'CONTADO' | 'CREDITO';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Pai, { eager: false })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, { eager: false })
  departamento: DepartamentosPai;

  @ManyToOne(() => MunicipiosDepartamentosPai, { eager: false })
  municipio: MunicipiosDepartamentosPai;

  // Campos de auditoría
  @ManyToOne(() => User, { eager: false })
  created_by: User;

  @ManyToOne(() => User, { eager: false })
  updated_by: User;

  @OneToMany(() => SubServicio, (producto) => producto.proveedor)
  productos: SubServicio[];

  @OneToMany(() => Insumo, (insumo) => insumo.proveedor)
  insumos: Insumo[];

  @OneToMany(() => EscalasProducto, (escala) => escala.proveedor)
  escalas: EscalasProducto[];

  @OneToMany(() => DescuentosProducto, (descuento) => descuento.proveedor)
  descuentos: DescuentosProducto[];
}
