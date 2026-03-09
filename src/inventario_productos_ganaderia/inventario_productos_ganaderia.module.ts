import { Module } from '@nestjs/common';
import { InventarioProductosGanaderiaService } from './inventario_productos_ganaderia.service';
import { InventarioProductosGanaderiaController } from './inventario_productos_ganaderia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioProductosGanaderia } from './entities/inventario_productos_ganaderia.entity';
import { ProductosGanaderia } from 'src/productos_ganaderia/entities/productos_ganaderia.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';

@Module({
  controllers: [InventarioProductosGanaderiaController],
  imports: [
    TypeOrmModule.forFeature([
      InventarioProductosGanaderia,
      ProductosGanaderia,
      FincasGanadero,
    ]),
    AuthClientesModule,
  ],
  providers: [InventarioProductosGanaderiaService],
})
export class InventarioProductosGanaderiaModule {}
