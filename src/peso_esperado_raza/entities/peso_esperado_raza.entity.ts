import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('peso_esperado_raza')
export class PesoEsperadoRaza {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  edadMinMeses: number;

  @Column({ type: 'int' })
  edadMaxMeses: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pesoEsperadoMin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pesoEsperadoMax: number;

  @ManyToOne(() => RazaAnimal, (raza) => raza.pesosEsperados, {
    onDelete: 'CASCADE',
  })
  raza: RazaAnimal;
}
