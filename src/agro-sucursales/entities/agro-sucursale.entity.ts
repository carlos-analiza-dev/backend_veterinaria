import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { TipoSucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('agro-sucursales')
export class AgroSucursale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: TipoSucursal,
    default: TipoSucursal.SUCURSAL,
  })
  tipo: TipoSucursal;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitud: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitud: number;

  @Column({ type: 'varchar', length: 255 })
  direccion_complemento: string;

  @ManyToOne(() => Pai, { eager: true })
  @JoinColumn({ name: 'paisId' })
  pais: Pai;

  @Column({ type: 'uuid', nullable: true })
  paisId: string;

  @ManyToOne(() => DepartamentosPai, { eager: true })
  @JoinColumn({ name: 'departamentoId' })
  departamento: DepartamentosPai;

  @Column({ type: 'uuid', nullable: true })
  departamentoId: string;

  @ManyToOne(() => MunicipiosDepartamentosPai, { eager: true })
  @JoinColumn({ name: 'municipioId' })
  municipio: MunicipiosDepartamentosPai;

  @Column({ type: 'uuid', nullable: true })
  municipioId: string;

  @ManyToOne(() => EmpleadosAgro, { eager: false })
  @JoinColumn({ name: 'gerenteId' })
  gerente: EmpleadosAgro;

  @OneToMany(() => EmpleadosAgro, (empleado) => empleado.sucursal)
  empleados: EmpleadosAgro[];

  @Column({ type: 'uuid', nullable: true })
  gerenteId: string;

  @ManyToOne(
    () => DatosAgroservicio,
    (agroservicio) => agroservicio.sucursales,
    {
      eager: false,
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'agroservicioId' })
  agroservicio: DatosAgroservicio;

  @Column({ type: 'uuid' })
  agroservicioId: string;

  @Column({ nullable: true })
  creadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'creadoPorId' })
  creado_por: Cliente;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
