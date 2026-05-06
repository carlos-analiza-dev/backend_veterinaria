import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { TipoMantenimiento } from 'src/interfaces/maquinaria/maquinaria.enums';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mantenimiento_equipo')
export class MantenimientoEquipo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EquipoMaquinaria)
  equipo: EquipoMaquinaria;

  @Column({ type: 'enum', enum: TipoMantenimiento })
  tipo: TipoMantenimiento;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'timestamptz' })
  fecha_inicio: Date;

  @Column({ type: 'timestamptz' })
  fecha_final: Date;

  @Column({ type: 'decimal', nullable: true })
  costo: number;

  @Column({ type: 'date', nullable: true })
  proximoMantenimiento: Date;

  @Column({ type: 'boolean', default: false })
  notificado_mantenimiento_proximo: boolean;

  @Column({ type: 'boolean', default: false })
  notificadoFinalizacion: boolean;
}
