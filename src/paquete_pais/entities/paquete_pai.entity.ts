import { TipoPrecio } from 'src/interfaces/paquetes/paquetes.enum';
import { Pai } from 'src/pais/entities/pai.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('paquete_pais')
export class PaquetePais {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paquete, {
    onDelete: 'CASCADE',
  })
  paquete: Paquete;

  @ManyToOne(() => Pai, {
    eager: true,
    onDelete: 'CASCADE',
  })
  pais: Pai;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  precioMensual: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precioAnual: number;

  @Column({
    default: true,
  })
  isActive: boolean;
}
