import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('finca_ganadero')
export class FincasGanadero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre_finca: string;

  @Column({ type: 'int' })
  cantidad_animales: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion: string;

  @Column({ type: 'double precision', nullable: true })
  latitud: number;

  @Column({ type: 'double precision', nullable: true })
  longitud: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  abreviatura: string;

  @ManyToOne(() => DepartamentosPai, (departamento) => departamento.fincas)
  departamento: DepartamentosPai;

  @ManyToOne(() => MunicipiosDepartamentosPai, (municipio) => municipio.fincas)
  municipio: MunicipiosDepartamentosPai;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tamaño_total: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  area_ganaderia: string;

  @Column({ type: 'varchar', length: 255, default: 'ha' })
  medida_finca: string;

  @Column({ type: 'jsonb', nullable: true })
  tipo_explotacion: { tipo_explotacion: string }[];

  @Column({ type: 'jsonb', nullable: true })
  especies_maneja: { especie: string; cantidad: number }[];

  @CreateDateColumn()
  fecha_registro: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Cliente, (cliente) => cliente.fincas)
  propietario: Cliente;

  @ManyToOne(() => Pai, (pais) => pais.fincas)
  pais_id: Pai;

  @OneToMany(() => AnimalFinca, (animal) => animal.finca)
  animales: AnimalFinca[];

  @OneToOne(() => ProduccionFinca, (produccion) => produccion.finca, {
    cascade: true,
    nullable: true,
  })
  produccion: ProduccionFinca;
}
