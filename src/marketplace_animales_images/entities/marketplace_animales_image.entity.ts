import { MarketplaceAnimale } from 'src/marketplace_animales/entities/marketplace_animale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('market-animales-images')
export class MarketplaceAnimalesImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @ManyToOne(() => MarketplaceAnimale, (animal) => animal.marketAnimalImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'animalId' })
  animal: MarketplaceAnimale;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
