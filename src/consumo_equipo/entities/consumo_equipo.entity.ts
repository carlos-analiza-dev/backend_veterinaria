import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('consumo_equipo')
export class ConsumoEquipo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EquipoMaquinaria)
  equipo: EquipoMaquinaria;

  @Column()
  tipoCombustible: string;

  @Column({ type: 'decimal' })
  cantidad: number;

  @Column({ type: 'decimal' })
  costo: number;

  @Column({ type: 'date' })
  fecha: string;
}
