import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { MarketplaceAnimale } from 'src/marketplace_animales/entities/marketplace_animale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('marketplace_visualizaciones')
@Index(['publicacion', 'usuario'])
@Unique(['publicacionId', 'usuarioId', 'fecha_vista'])
export class MarketplaceVisualizacione {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MarketplaceAnimale, {
    onDelete: 'CASCADE',
  })
  publicacion: MarketplaceAnimale;

  @Column({ type: 'uuid' })
  publicacionId: string;

  @ManyToOne(() => Cliente, {
    onDelete: 'CASCADE',
  })
  usuario: Cliente;

  @Column({ type: 'uuid' })
  usuarioId: string;

  @Column({ type: 'date' })
  fecha_vista: Date;

  @CreateDateColumn()
  created_at: Date;
}
