import { TipoAgroservicio } from 'src/interfaces/paquetes/paquetes.enum';
import { RolesPermisosAgro } from 'src/roles-permisos-agro/entities/roles-permisos-agro.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permisos_clientes_agro')
export class PermisosClientesAgro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: TipoAgroservicio,
    default: TipoAgroservicio.AGRO_GESTION,
  })
  tipo: TipoAgroservicio;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 100 })
  url: string;

  @Column({ type: 'varchar', length: 50 })
  modulo: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => RolesPermisosAgro, (rp) => rp.permiso)
  roles: RolesPermisosAgro[];
}
