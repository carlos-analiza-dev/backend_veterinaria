import { ImagesAnuncio } from 'src/images_anuncios/entities/images_anuncio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EtiquetaAnuncio {
  PATROCINADO = 'PATROCINADO',
  OFERTA = 'OFERTA ESPECIAL',
}

@Entity('anuncios')
export class AnunciosPrincipale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  link: string;

  @Column({ type: 'boolean', default: false })
  esPrincipal: boolean;

  @Column({ type: 'boolean', default: true })
  mostrar: boolean;

  @Column({
    type: 'enum',
    enum: EtiquetaAnuncio,
    default: EtiquetaAnuncio.PATROCINADO,
  })
  etiqueta: EtiquetaAnuncio;

  @ManyToOne(() => Pai, {
    eager: true,
  })
  pais: Pai;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @OneToMany(() => ImagesAnuncio, (profileImage) => profileImage.anuncios, {
    eager: true,
  })
  anucioImages: ImagesAnuncio[];
}
