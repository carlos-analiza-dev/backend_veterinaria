import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cliente_paquetes')
export class ClientePaquete {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;

  @ManyToOne(() => Paquete, {
    eager: true,
  })
  paquete: Paquete;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaInicio: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fechaFin: Date;

  @Column({
    default: true,
  })
  activo: boolean;
}
