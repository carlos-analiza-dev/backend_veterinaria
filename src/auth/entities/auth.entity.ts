import { Exclude } from 'class-transformer';
import { AnalisisEficiencia } from 'src/analisis_usuario/entities/analisis_usuario.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { InsumosUsuario } from 'src/insumos_usuario/entities/insumos_usuario.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import { ProfileImage } from 'src/profile_images/entities/profile_image.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Exclude()
  @Column('text', { select: true })
  password: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  identificacion: string;

  @Column('text')
  direccion: string;

  @Column('text')
  sexo: string;

  @Column('text', { unique: true })
  telefono: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isAuthorized: boolean;

  @ManyToOne(() => Pai, (pais) => pais.usuario, { eager: true })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, (departamento) => departamento.usuarios, {
    eager: true,
  })
  departamento: DepartamentosPai;

  @ManyToOne(
    () => MunicipiosDepartamentosPai,
    (municipio) => municipio.usuarios,
    { eager: true },
  )
  municipio: MunicipiosDepartamentosPai;

  @OneToMany(() => ProfileImage, (profileImage) => profileImage.user, {
    eager: true,
  })
  profileImages: ProfileImage[];

  @OneToMany(() => InsumosUsuario, (insumo) => insumo.user)
  insumosCapex: InsumosUsuario[];

  @OneToMany(() => AnalisisEficiencia, (analisis) => analisis.user)
  analisisEficiencia: AnalisisEficiencia[];

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.usuarios, { eager: true })
  @JoinColumn({ name: 'sucursalId' })
  sucursal: Sucursal;

  get currentProfileImage(): ProfileImage | null {
    if (!this.profileImages || this.profileImages.length === 0) return null;

    return this.profileImages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];
  }

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
