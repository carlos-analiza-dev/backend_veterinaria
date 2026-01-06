import { Module } from '@nestjs/common';
import { ProductoOpinionesService } from './producto_opiniones.service';
import { ProductoOpinionesController } from './producto_opiniones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoOpinione } from './entities/producto_opinione.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { ProductoRatingResumen } from 'src/producto_rating_resumen/entities/producto_rating_resuman.entity';

@Module({
  controllers: [ProductoOpinionesController],
  imports: [
    TypeOrmModule.forFeature([
      ProductoOpinione,
      SubServicio,
      Cliente,
      ProductoRatingResumen,
    ]),
    AuthClientesModule,
  ],
  providers: [ProductoOpinionesService],
})
export class ProductoOpinionesModule {}
