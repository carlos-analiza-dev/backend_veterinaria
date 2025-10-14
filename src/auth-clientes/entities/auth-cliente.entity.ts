import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Exclude } from 'class-transformer';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ImagesClient } from 'src/images_client/entities/images_client.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Entity('clientes')
export class Cliente {
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

  @ManyToOne(() => Pai, (pais) => pais.cliente, { eager: true })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, (departamento) => departamento.clientes, {
    eager: true,
  })
  departamento: DepartamentosPai;

  @ManyToOne(
    () => MunicipiosDepartamentosPai,
    (municipio) => municipio.clientes,
    { eager: true },
  )
  municipio: MunicipiosDepartamentosPai;

  @OneToMany(() => FincasGanadero, (fincas) => fincas.propietario)
  fincas: FincasGanadero[];

  @OneToMany(() => AnimalFinca, (animal) => animal.propietario)
  animales: AnimalFinca[];

  @OneToMany(() => ProduccionFinca, (produccion) => produccion.propietario)
  producciones: ProduccionFinca[];

  @OneToMany(() => ImagesClient, (profileImage) => profileImage.cliente, {
    eager: true,
  })
  profileImages: ImagesClient[];

  get currentProfileImage(): ImagesClient | null {
    if (!this.profileImages || this.profileImages.length === 0) return null;

    return this.profileImages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];
  }

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
