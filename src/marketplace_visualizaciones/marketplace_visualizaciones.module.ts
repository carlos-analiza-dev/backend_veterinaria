import { Module } from '@nestjs/common';
import { MarketplaceVisualizacionesService } from './marketplace_visualizaciones.service';
import { MarketplaceVisualizacionesController } from './marketplace_visualizaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceVisualizacione } from './entities/marketplace_visualizacione.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { MarketplaceAnimale } from 'src/marketplace_animales/entities/marketplace_animale.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [MarketplaceVisualizacionesController],
  imports: [
    TypeOrmModule.forFeature([
      MarketplaceVisualizacione,
      Cliente,
      MarketplaceAnimale,
    ]),
    AuthClientesModule,
  ],
  providers: [MarketplaceVisualizacionesService],
})
export class MarketplaceVisualizacionesModule {}
