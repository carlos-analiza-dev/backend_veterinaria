import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { GananciaPesoRaza } from 'src/ganancia_peso_raza/entities/ganancia_peso_raza.entity';
import { PesoEsperadoRaza } from 'src/peso_esperado_raza/entities/peso_esperado_raza.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('raza_animal')
export class RazaAnimal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  abreviatura: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => AnimalFinca, (animal) => animal.razas)
  animales: AnimalFinca[];

  @ManyToOne(() => EspecieAnimal, (especie) => especie.razas)
  especie: EspecieAnimal;

  @OneToMany(() => PesoEsperadoRaza, (peso) => peso.raza)
  pesosEsperados: PesoEsperadoRaza;

  @OneToMany(() => GananciaPesoRaza, (ganancia) => ganancia.raza)
  gananciasPesoRaza: GananciaPesoRaza[];
}
