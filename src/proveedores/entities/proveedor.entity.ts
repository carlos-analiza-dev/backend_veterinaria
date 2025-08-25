import { User } from 'src/auth/entities/auth.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
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

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Pai, { eager: true, nullable: true })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, { eager: true, nullable: true })
  departamento: DepartamentosPai;

  @ManyToOne(() => MunicipiosDepartamentosPai, { eager: true, nullable: true })
  municipio: MunicipiosDepartamentosPai;

  // Campos de auditoría
  @ManyToOne(() => User, { eager: true })
  created_by: User;

  @ManyToOne(() => User, { eager: true })
  updated_by: User;

  @OneToMany(() => SubServicio, (producto) => producto.proveedor)
  productos: SubServicio[];
}
