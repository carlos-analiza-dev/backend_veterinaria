import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('uso_equipo')
export class UsoEquipo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EquipoMaquinaria)
  equipo: EquipoMaquinaria;

  @ManyToOne(() => ActividadesDiaria, { nullable: true })
  actividad: ActividadesDiaria;

  @ManyToOne(() => Cliente, { nullable: true })
  operador: Cliente;

  @Column({ type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ type: 'timestamptz' })
  fechaFin: Date;

  @Column({ type: 'decimal' })
  horasTrabajadas: number;
}
