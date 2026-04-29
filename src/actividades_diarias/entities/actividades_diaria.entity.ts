import { ActividadFoto } from 'src/actividad_fotos/entities/actividad_foto.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import {
  EstadoActividad,
  FrecuenciaActividad,
  TipoActividad,
} from 'src/interfaces/actividades/actividaes.enums';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('actividades_diarias')
export class ActividadesDiaria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.actividadesRealizadas)
  @JoinColumn({ name: 'trabajadorId' })
  trabajador: Cliente;

  @Column({ type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.actividadesAsignadas)
  @JoinColumn({ name: 'propietarioId' })
  propietario: Cliente;

  @Column({ type: 'uuid' })
  propietarioId: string;

  @ManyToOne(() => FincasGanadero, (finca) => finca.actividades)
  @JoinColumn({ name: 'fincaId' })
  finca: FincasGanadero;

  @Column({ type: 'uuid', nullable: true })
  fincaId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({
    type: 'enum',
    enum: TipoActividad,
  })
  tipo: TipoActividad;

  @Column({
    type: 'enum',
    enum: EstadoActividad,
    default: EstadoActividad.PENDIENTE,
  })
  estado: EstadoActividad;

  @Column({
    type: 'enum',
    enum: FrecuenciaActividad,
    default: FrecuenciaActividad.DIARIA,
  })
  frecuencia: FrecuenciaActividad;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: false })
  completada: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => ActividadFoto, (foto) => foto.actividad, {
    cascade: true,
  })
  fotos: ActividadFoto[];
}
