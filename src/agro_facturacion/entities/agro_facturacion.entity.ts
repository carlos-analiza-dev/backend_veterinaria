import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('agro_facturacion')
export class AgroFacturacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
