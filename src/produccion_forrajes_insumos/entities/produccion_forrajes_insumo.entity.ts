import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('produccion_forrajes_insumo')
export class ProduccionForrajesInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment:
      'Puede contener: Heno, Silo, Pasto, Harina, Alimentos Concentrados elaborados, Otros',
  })
  insumos: Array<{
    tipo:
      | 'Heno'
      | 'Silo'
      | 'Pasto'
      | 'Harina'
      | 'Alimentos Concentrados elaborados'
      | 'Otros';

    tipo_heno?: string;
    estacionalidad_heno?: string;
    meses_produccion_heno?: string[];

    tiempo_estimado_cultivo?: string;
    produccion_manzana?: string;

    descripcion_otro?: string;
  }>;
  @OneToOne(() => ProduccionFinca, (produccion) => produccion.forrajesInsumo)
  @JoinColumn()
  produccionFinca: ProduccionFinca;
}
