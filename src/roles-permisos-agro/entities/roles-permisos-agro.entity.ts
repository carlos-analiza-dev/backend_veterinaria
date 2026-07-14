import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RolesAgro } from 'src/roles-agro/entities/roles-agro.entity';
import { PermisosClientesAgro } from 'src/permisos_clientes_agro/entities/permisos_clientes_agro.entity';

@Entity('roles_permisos_agro')
export class RolesPermisosAgro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RolesAgro, (rol) => rol.permisos, { eager: true })
  @JoinColumn({ name: 'roleId' })
  rol: RolesAgro;

  @ManyToOne(() => PermisosClientesAgro, (permiso) => permiso.roles, {
    eager: true,
  })
  @JoinColumn({ name: 'permisoId' })
  permiso: PermisosClientesAgro;
}
