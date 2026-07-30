import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('agro_clientes')
export class AgroCliente {
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

  @Column('text', { nullable: true })
  direccion: string;

  @Column('text')
  sexo: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Pai, (pais) => pais.agro_cliente, { eager: true })
  pais: Pai;

  @ManyToOne(() => DatosAgroservicio, (datos) => datos.agro_cliente, {
    eager: true,
  })
  agroservicio: DatosAgroservicio;

  @ManyToOne(
    () => DepartamentosPai,
    (departamento) => departamento.agro_clientes,
    {
      eager: true,
    },
  )
  departamento: DepartamentosPai;

  @ManyToOne(
    () => MunicipiosDepartamentosPai,
    (municipio) => municipio.agro_clientes,
    { eager: true },
  )
  municipio: MunicipiosDepartamentosPai;

  @CreateDateColumn()
  fecha: Date;
}
