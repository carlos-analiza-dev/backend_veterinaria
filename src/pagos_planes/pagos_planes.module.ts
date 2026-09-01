import { Module } from '@nestjs/common';
import { PagosPlanesService } from './pagos_planes.service';
import { PagosPlanesController } from './pagos_planes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosPlane } from './entities/pagos_plane.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { PaquetePais } from 'src/paquete_pais/entities/paquete_pai.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { WompiService } from 'src/validations/wompi/wompi.service';

@Module({
  controllers: [PagosPlanesController],
  imports: [
    TypeOrmModule.forFeature([PagosPlane, Paquete, PaquetePais]),
    AuthClientesModule,
  ],
  providers: [PagosPlanesService, WompiService],
})
export class PagosPlanesModule {}
