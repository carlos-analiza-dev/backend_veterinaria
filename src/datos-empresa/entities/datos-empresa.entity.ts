import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('datos_empresa')
export class DatosEmpresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre_empresa: string;

  @Column({ unique: true, length: 14 })
  rtn: string;

  @Column()
  propietario: string;

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
