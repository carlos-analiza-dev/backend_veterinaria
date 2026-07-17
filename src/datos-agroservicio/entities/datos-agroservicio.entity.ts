import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { LogosAgroservicio } from 'src/logos-agroservicios/entities/logos-agroservicio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('datos-agroservicio')
export class DatosAgroservicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre_agroservicio: string;

  @Column({ unique: true, length: 14 })
  rtn: string;

  @OneToOne(() => Cliente, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Cliente;

  @Column()
  propietarioId: string;

  @OneToOne(() => Pai, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paisId' })
  pais: Cliente;

  @Column()
  paisId: string;

  @OneToMany(() => AgroSucursale, (sucursal) => sucursal.agroservicio)
  sucursales: AgroSucursale[];

  @OneToOne(() => LogosAgroservicio, (logo) => logo.agroservicio, {
    cascade: true,
    eager: true,
  })
  logo: LogosAgroservicio;

  @Column()
  correo: string;

  @Column()
  telefono: string;

  @Column('text')
  direccion: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
