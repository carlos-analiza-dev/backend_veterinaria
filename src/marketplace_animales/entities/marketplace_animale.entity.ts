import { IsNotEmpty, IsString } from 'class-validator';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { MarketplaceAnimalesImage } from 'src/marketplace_animales_images/entities/marketplace_animales_image.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { TipoProducto } from 'src/tipo_producto/entities/tipo_producto.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('marketplace_animales')
export class MarketplaceAnimale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimalFinca, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animalId' })
  animal: AnimalFinca;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  precio: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  precio_oferta?: number;

  @Column({ type: 'varchar' })
  moneda: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitud: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitud: number;

  @Column({ type: 'varchar', length: 255 })
  direccion_completa: string;

  @Column({ type: 'int', default: 1 })
  stock: number;

  @OneToMany(
    () => MarketplaceAnimalesImage,
    (profileImage) => profileImage.animal,
    {
      eager: true,
    },
  )
  marketAnimalImages: MarketplaceAnimalesImage[];

  @ManyToOne(() => Categoria, { eager: true })
  categoria: Categoria;

  @ManyToOne(() => Subcategoria, { eager: true })
  subcategoria: Subcategoria;

  @ManyToOne(() => Marca, {
    eager: true,
    nullable: true,
  })
  marca: Marca;

  @ManyToOne(() => TipoProducto, {
    eager: true,
    nullable: true,
  })
  tipo_producto: TipoProducto;

  @ManyToOne(() => Cliente, {
    eager: true,
  })
  @JoinColumn({ name: 'vendedorId' })
  vendedor: Cliente;

  @ManyToOne(() => Pai, { eager: true })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, { eager: true })
  departamento: DepartamentosPai;

  @Column({ type: 'int', default: 0 })
  favoritos: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'boolean', default: true })
  disponible: boolean;

  @Column({ type: 'boolean', default: false })
  vendido: boolean;

  @Column({ type: 'boolean', default: false })
  oferta: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
