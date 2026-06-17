import { AnunciosPrincipale } from 'src/anuncios_principales/entities/anuncios_principale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('images_anuncios')
export class ImagesAnuncio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @ManyToOne(() => AnunciosPrincipale, (anuncio) => anuncio.anucioImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'anuncioId' })
  anuncios: AnunciosPrincipale;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
