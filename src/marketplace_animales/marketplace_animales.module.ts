import { Module } from '@nestjs/common';
import { MarketplaceAnimalesService } from './marketplace_animales.service';
import { MarketplaceAnimalesController } from './marketplace_animales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceAnimalesImage } from 'src/marketplace_animales_images/entities/marketplace_animales_image.entity';
import { MarketplaceAnimale } from './entities/marketplace_animale.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { TipoProducto } from 'src/tipo_producto/entities/tipo_producto.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { DistanceSucursalesModule } from 'src/distance_sucursales/distance_sucursales.module';

@Module({
  controllers: [MarketplaceAnimalesController],
  imports: [
    TypeOrmModule.forFeature([
      MarketplaceAnimale,
      MarketplaceAnimalesImage,
      Pai,
      DepartamentosPai,
      Categoria,
      Subcategoria,
      Marca,
      TipoProducto,
      Cliente,
      AnimalFinca,
    ]),
    AuthClientesModule,
    DistanceSucursalesModule,
  ],
  providers: [MarketplaceAnimalesService],
})
export class MarketplaceAnimalesModule {}
