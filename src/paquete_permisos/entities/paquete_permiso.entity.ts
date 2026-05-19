import { PermisosCliente } from 'src/permisos_clientes/entities/permisos_cliente.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('paquete_permisos')
export class PaquetePermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paquete, (paquete) => paquete.permisos, {
    onDelete: 'CASCADE',
  })
  paquete: Paquete;

  @ManyToOne(() => PermisosCliente, {
    eager: true,
    onDelete: 'CASCADE',
  })
  permiso: PermisosCliente;

  @Column({ type: 'boolean', default: true })
  ver: boolean;

  @Column({ type: 'boolean', default: false })
  crear: boolean;

  @Column({ type: 'boolean', default: false })
  editar: boolean;

  @Column({ type: 'boolean', default: false })
  eliminar: boolean;
}
