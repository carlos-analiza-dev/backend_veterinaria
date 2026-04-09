import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cliente_finca_trabajador')
export class ClienteFincaTrabajador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.asignacionesTrabajador)
  trabajador: Cliente;

  @ManyToOne(() => FincasGanadero, (finca) => finca.asignaciones)
  finca: FincasGanadero;

  @ManyToOne(() => Cliente, (cliente) => cliente.asignacionesRealizadas)
  asignadoPor: Cliente;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaAsignacion: Date;
}
