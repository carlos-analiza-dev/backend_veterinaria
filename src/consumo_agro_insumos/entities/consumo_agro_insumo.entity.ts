import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { InvLoteAgroInsumo } from 'src/compra-insumos/entities/inv-lote-agro-insumo.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('consumo_agro_insumos')
export class ConsumoAgroInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgroSucursale, { nullable: false })
  @JoinColumn({ name: 'sucursalId' })
  sucursal: AgroSucursale;

  @ManyToOne(() => AgroInsumos, { nullable: false })
  @JoinColumn({ name: 'insumoId' })
  insumo: AgroInsumos;

  @ManyToOne(() => InvLoteAgroInsumo, { nullable: false })
  @JoinColumn({ name: 'loteId' })
  lote: InvLoteAgroInsumo;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  cantidad: number;

  @Column({
    type: 'date',
  })
  fecha_consumo: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  observacion?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
