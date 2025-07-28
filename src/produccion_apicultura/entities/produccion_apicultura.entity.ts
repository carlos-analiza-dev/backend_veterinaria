import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('produccion_apicultura')
export class ProduccionApicultura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  numero_colmenas: number;

  @Column({ type: 'varchar', length: 100 })
  frecuencia_cosecha: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad_por_cosecha: number;

  @Column({ type: 'enum', enum: ['Oscura', 'Clara', 'Multifloral'] })
  calidad_miel: 'Oscura' | 'Clara' | 'Multifloral';

  @OneToOne(() => ProduccionFinca, (produccion) => produccion.apicultura)
  produccionFinca: ProduccionFinca;
}
