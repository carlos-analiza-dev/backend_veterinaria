import { ClientePermiso } from 'src/cliente_permisos/entities/cliente_permiso.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permisos_clientes')
export class PermisosCliente {
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

  @OneToMany(() => ClientePermiso, (cp) => cp.permiso)
  clientePermisos: ClientePermiso[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
