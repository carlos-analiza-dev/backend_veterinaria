import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';
import { ClienteFincaTrabajador } from 'src/cliente_finca_trabajador/entities/cliente_finca_trabajador.entity';
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

  @ManyToOne(() => ClienteFincaTrabajador, { nullable: true })
  operador: ClienteFincaTrabajador;

  @Column({ type: 'timestamp' })
  fechaInicio: Date;

  @Column({ type: 'timestamp' })
  fechaFin: Date;

  @Column({ type: 'decimal' })
  horasTrabajadas: number;

  @Column({ type: 'decimal', nullable: true })
  combustibleUsado: number;
}
