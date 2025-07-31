import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('produccion_agricola')
export class ProduccionAgricola {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment:
      'Puede contener: Maíz, Frijol, Arroz, Sorgo, Café, Papa, Tomate, Cebolla, Ajo, Yuca, Hortalizas, Frutas, Otros',
  })
  cultivos: Array<{
    tipo:
      | 'Maíz'
      | 'Frijol'
      | 'Arroz'
      | 'Sorgo'
      | 'Café'
      | 'Papa'
      | 'Tomate'
      | 'Cebolla'
      | 'Ajo'
      | 'Yuca'
      | 'Hortalizas'
      | 'Frutas'
      | 'Otros';
    descripcion?: string;
    estacionalidad: string;
    tiempo_estimado_cultivo: string;
    meses_produccion: string[];
    cantidad_producida_hectareas: string;
  }>;

  @OneToOne(() => ProduccionFinca, (produccion) => produccion.agricola)
  produccionFinca: ProduccionFinca;
}
