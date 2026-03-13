import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import {
  OrigenAlimento,
  TipoAlimento,
} from 'src/interfaces/alimentacion.interface';
import { UnidadMedida } from 'src/interfaces/unidad-medida';

@Entity('alimentacion_animal')
export class AlimentacionAnimal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TipoAlimento,
  })
  tipoAlimento: TipoAlimento;

  @Column({
    type: 'enum',
    enum: OrigenAlimento,
  })
  origen: OrigenAlimento;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @Column({
    type: 'enum',
    enum: UnidadMedida,
  })
  unidad: UnidadMedida;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo_diario: number;

  @Column({ type: 'date' })
  fecha: Date;

  @ManyToOne(() => AnimalFinca)
  animal: AnimalFinca;
}
