import { RolesPermisosAgro } from 'src/roles-permisos-agro/entities/roles-permisos-agro.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permisos_clientes_agro')
export class PermisosClientesAgro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, unique: true })
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
