import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { RolesPermisosAgro } from 'src/roles-permisos-agro/entities/roles-permisos-agro.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles_agro')
export class RolesAgro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => EmpleadosAgro, (empleado) => empleado.role)
  empleado: EmpleadosAgro[];

  @OneToMany(() => RolesPermisosAgro, (rp) => rp.rol)
  permisos: RolesPermisosAgro[];
}
