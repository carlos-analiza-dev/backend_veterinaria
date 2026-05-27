import { TipoPaquete } from 'src/interfaces/paquetes/paquetes.enum';
import { PaquetePais } from 'src/paquete_pais/entities/paquete_pai.entity';
import { PaquetePermiso } from 'src/paquete_permisos/entities/paquete_permiso.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('paquetes')
export class Paquete {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({
    type: 'enum',
    enum: TipoPaquete,
  })
  tipo: TipoPaquete;

  @Column({ default: 1 })
  maxFincas: number;

  @Column({ default: 5 })
  maxAnimales: number;

  @Column({ default: 1 })
  maxTrabajadores: number;

  @Column({ default: true })
  ecommerce: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PaquetePais, (paquetePais) => paquetePais.paquete)
  preciosPorPais: PaquetePais[];

  @OneToMany(() => PaquetePermiso, (paquetePermiso) => paquetePermiso.paquete)
  permisos: PaquetePermiso[];
}
