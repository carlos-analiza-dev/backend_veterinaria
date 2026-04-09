import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Exclude } from 'class-transformer';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ImagesClient } from 'src/images_client/entities/images_client.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import { ClientePermiso } from 'src/cliente_permisos/entities/cliente_permiso.entity';
import { ProductoOpinione } from 'src/producto_opiniones/entities/producto_opinione.entity';
import { ProductosGanaderia } from 'src/productos_ganaderia/entities/productos_ganaderia.entity';
import { GananciaPesoRaza } from 'src/ganancia_peso_raza/entities/ganancia_peso_raza.entity';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { ClienteFincaTrabajador } from 'src/cliente_finca_trabajador/entities/cliente_finca_trabajador.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre: string;

  @Column('text', { unique: true })
  identificacion: string;

  @Column('text', { unique: true })
  telefono: string;

  @Column('text', { nullable: true, unique: true })
  email: string;

  @Exclude()
  @Column('text', { select: true })
  password: string;

  @Column('text', { nullable: true })
  direccion: string;

  @Column('text')
  sexo: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({
    type: 'enum',
    enum: TipoCliente,
    default: TipoCliente.PROPIETARIO,
  })
  rol: string;

  @ManyToOne(() => Pai, (pais) => pais.cliente, { eager: true })
  pais: Pai;

  @ManyToOne(() => DepartamentosPai, (departamento) => departamento.clientes, {
    eager: true,
  })
  departamento: DepartamentosPai;

  @ManyToOne(
    () => MunicipiosDepartamentosPai,
    (municipio) => municipio.clientes,
    { eager: true },
  )
  municipio: MunicipiosDepartamentosPai;

  @OneToMany(() => FincasGanadero, (fincas) => fincas.propietario)
  fincas: FincasGanadero[];

  @OneToMany(() => AnimalFinca, (animal) => animal.propietario)
  animales: AnimalFinca[];

  @OneToMany(() => ProduccionFinca, (produccion) => produccion.propietario)
  producciones: ProduccionFinca[];

  @OneToMany(() => ImagesClient, (profileImage) => profileImage.cliente, {
    eager: true,
  })
  profileImages: ImagesClient[];

  @OneToMany(() => ClientePermiso, (cp) => cp.cliente)
  clientePermisos: ClientePermiso[];

  @OneToMany(() => ProductoOpinione, (opinion) => opinion.cliente)
  opiniones: ProductoOpinione[];

  @OneToMany(() => ProductosGanaderia, (producto) => producto.propietario)
  productos: ProductosGanaderia[];

  @OneToMany(() => GananciaPesoRaza, (ganancia) => ganancia.cliente)
  gananciasPesoRaza: GananciaPesoRaza[];

  get currentProfileImage(): ImagesClient | null {
    if (!this.profileImages || this.profileImages.length === 0) return null;

    return this.profileImages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];
  }

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  creadoPor: Cliente;

  //NUEVAS RELACIONES
  @OneToMany(
    () => ClienteFincaTrabajador,
    (asignacion) => asignacion.trabajador,
  )
  asignacionesTrabajador: ClienteFincaTrabajador[];

  @OneToMany(
    () => ClienteFincaTrabajador,
    (asignacion) => asignacion.asignadoPor,
  )
  asignacionesRealizadas: ClienteFincaTrabajador[];

  @OneToMany(() => Cliente, (cliente) => cliente.propietario)
  trabajadores: Cliente[];

  @ManyToOne(() => Cliente, (cliente) => cliente.trabajadores, {
    nullable: true,
  })
  propietario: Cliente;
}
