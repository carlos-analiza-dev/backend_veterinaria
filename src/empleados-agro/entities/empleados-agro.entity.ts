import { Exclude } from 'class-transformer';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { RolesAgro } from 'src/roles-agro/entities/roles-agro.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('empleados_agro')
export class EmpleadosAgro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre: string;

  @Column('text', { unique: true })
  identificacion: string;

  @Column('text', { unique: true })
  telefono: string;

  @Column('text', { nullable: true, unique: true })
  email: string;

  @Exclude()
  @Column('text', { select: true })
  password: string;

  @Column('text', { nullable: true })
  direccion: string;

  @Column('text')
  sexo: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @ManyToOne(() => RolesAgro, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: RolesAgro;

  @ManyToOne(() => Pai, (pais) => pais.empleado, { eager: true })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, (departamento) => departamento.empleados, {
    eager: true,
  })
  departamento: DepartamentosPai;

  @ManyToOne(
    () => MunicipiosDepartamentosPai,
    (municipio) => municipio.empleados,
    { eager: true },
  )
  municipio: MunicipiosDepartamentosPai;

  @ManyToOne(() => AgroSucursale, (sucursal) => sucursal.empleados, {
    eager: true,
  })
  @JoinColumn({ name: 'sucursalId' })
  sucursal: AgroSucursale;

  creadoPor: Cliente;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
