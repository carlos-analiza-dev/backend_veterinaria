import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { UnidadMedida } from 'src/interfaces/unidad-medida';
import { ProductosGanaderia } from 'src/productos_ganaderia/entities/productos_ganaderia.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventario_productos_ganaderia')
export class InventarioProductosGanaderia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductosGanaderia, { onDelete: 'CASCADE' })
  producto: ProductosGanaderia;

  @ManyToOne(() => FincasGanadero, { onDelete: 'CASCADE' })
  finca: FincasGanadero;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  cantidad: number;

  @Column({
    type: 'enum',
    enum: UnidadMedida,
  })
  unidadMedida: UnidadMedida;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  stockMinimo: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @Column({ nullable: true })
  creadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'creadoPorId' })
  creado_por: Cliente;

  @Column({ nullable: true })
  actualizadoPorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'actualizadoPorId' })
  actualizado_por: Cliente;
}
