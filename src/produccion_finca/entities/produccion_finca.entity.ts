import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ProduccionAgricola } from 'src/produccion_agricola/entities/produccion_agricola.entity';
import { ProduccionAlternativa } from 'src/produccion_alternativa/entities/produccion_alternativa.entity';
import { ProduccionApicultura } from 'src/produccion_apicultura/entities/produccion_apicultura.entity';
import { ProduccionForrajesInsumo } from 'src/produccion_forrajes_insumos/entities/produccion_forrajes_insumo.entity';
import { ProduccionGanadera } from 'src/produccion_ganadera/entities/produccion_ganadera.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  ManyToOne,
} from 'typeorm';

@Entity('produccion_finca')
export class ProduccionFinca {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => FincasGanadero, (finca) => finca.produccion)
  @JoinColumn()
  finca: FincasGanadero;

  @OneToOne(() => ProduccionGanadera, (prod) => prod.produccionFinca, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  ganadera?: ProduccionGanadera;

  @OneToOne(() => ProduccionAgricola, (prod) => prod.produccionFinca, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  agricola?: ProduccionAgricola;

  @OneToOne(() => ProduccionForrajesInsumo, (prod) => prod.produccionFinca, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  forrajesInsumo?: ProduccionForrajesInsumo;

  @OneToOne(() => ProduccionAlternativa, (prod) => prod.produccionFinca, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  alternativa?: ProduccionAlternativa;

  @OneToOne(() => ProduccionApicultura, (prod) => prod.produccionFinca, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  apicultura?: ProduccionApicultura;

  @ManyToOne(() => Cliente, (cliente) => cliente.producciones)
  @JoinColumn({ name: 'userId' })
  propietario: Cliente;

  @Column({ type: 'bool', default: false })
  produccion_mixta: boolean;

  @Column({ type: 'bool', default: false })
  transformacion_artesanal: boolean;

  @Column({ type: 'bool', default: false })
  consumo_propio: boolean;

  @Column({ type: 'bool', default: false })
  produccion_venta: boolean;
}
