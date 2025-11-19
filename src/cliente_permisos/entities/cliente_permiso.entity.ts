import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PermisosCliente } from 'src/permisos_clientes/entities/permisos_cliente.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cliente_permisos')
export class ClientePermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.clientePermisos, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;

  @ManyToOne(() => PermisosCliente, (permiso) => permiso.clientePermisos, {
    onDelete: 'CASCADE',
  })
  permiso: PermisosCliente;

  @Column({ type: 'boolean', default: false })
  ver: boolean;

  @Column({ type: 'boolean', default: false })
  crear: boolean;

  @Column({ type: 'boolean', default: false })
  editar: boolean;

  @Column({ type: 'boolean', default: false })
  eliminar: boolean;
}
