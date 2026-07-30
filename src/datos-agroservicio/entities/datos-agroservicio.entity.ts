import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { AgroCliente } from 'src/agro_clientes/entities/agro_cliente.entity';
import { AgroRangoFactura } from 'src/agro_facturacion/entities/rangos-agro-factura.entity';
import { AgroImpuesto } from 'src/agro_impuestos/entities/agro_impuesto.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { DescuentosAgroCliente } from 'src/descuentos_clientes/entities/descuentos_clientes_agro.entity';
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

  @OneToMany(() => AgroProveedore, (proveedor) => proveedor.agroservicio)
  proveedores: AgroProveedore[];

  @OneToMany(() => AgroImpuesto, (tax) => tax.agroservicio)
  impuestos: AgroImpuesto[];

  @OneToMany(() => AgroRangoFactura, (rango) => rango.agroservicio)
  rango_factura: AgroRangoFactura[];

  @OneToMany(() => DescuentosAgroCliente, (desc) => desc.agroservicio)
  descuentos: DescuentosAgroCliente[];

  @OneToMany(() => AgroCliente, (cliente) => cliente.agroservicio)
  agro_cliente: AgroCliente[];

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
