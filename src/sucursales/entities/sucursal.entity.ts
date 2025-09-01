import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MunicipiosDepartamentosPai } from '../../municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DepartamentosPai } from '../../departamentos_pais/entities/departamentos_pai.entity';
import { Pai } from '../../pais/entities/pai.entity';
import { User } from '../../auth/entities/auth.entity';

export enum TipoSucursal {
  BODEGA = 'bodega',
  CASA_MATRIZ = 'casa_matriz',
  SUCURSAL = 'sucursal',
}

@Entity('sucursales')
export class Sucursal {
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

  // Dirección - Complemento (dirección específica)
  @Column({ type: 'varchar', length: 255 })
  direccion_complemento: string;

  // Relación con País
  @ManyToOne(() => Pai, { eager: true })
  @JoinColumn({ name: 'paisId' })
  pais: Pai;

  @Column({ type: 'uuid', nullable: true })
  paisId: string;

  // Relación con Departamento
  @ManyToOne(() => DepartamentosPai, { eager: true })
  @JoinColumn({ name: 'departamentoId' })
  departamento: DepartamentosPai;

  @Column({ type: 'uuid', nullable: true })
  departamentoId: string;

  // Relación con Municipio
  @ManyToOne(() => MunicipiosDepartamentosPai, { eager: true })
  @JoinColumn({ name: 'municipioId' })
  municipio: MunicipiosDepartamentosPai;

  @Column({ type: 'uuid', nullable: true })
  municipioId: string;

  // Relación con Gerente (Usuario)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'gerenteId' })
  gerente: User;

  @Column({ type: 'uuid', nullable: true })
  gerenteId: string;

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
