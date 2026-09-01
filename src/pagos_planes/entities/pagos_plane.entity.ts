import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  ERROR = 'ERROR',
}

export enum TipoPrecio {
  MENSUAL = 'mensual',
  ANUAL = 'anual',
}

@Entity('pagos_planes')
export class PagosPlane {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  referencia: string;

  @Column({
    nullable: true,
    unique: true,
  })
  wompiTransaccionId?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  monto: string;

  @Column({
    type: 'enum',
    enum: EstadoPago,
    default: EstadoPago.PENDIENTE,
  })
  estado: EstadoPago;

  @Column({
    type: 'enum',
    enum: TipoPrecio,
    default: TipoPrecio.MENSUAL,
  })
  tipoPrecio: TipoPrecio;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column()
  clienteId: string;

  @ManyToOne(() => Paquete)
  @JoinColumn({ name: 'paqueteId' })
  paquete: Paquete;

  @Column()
  paqueteId: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  respuestaWompi?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
