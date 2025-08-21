import { Module } from '@nestjs/common';
import { SubServiciosService } from './sub_servicios.service';
import { SubServiciosController } from './sub_servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubServicio } from './entities/sub_servicio.entity';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';

@Module({
  controllers: [SubServiciosController],
  imports: [
    TypeOrmModule.forFeature([
      SubServicio,
      Servicio,
      Pai,
      ServiciosPai,
      InventarioProducto,
    ]),
  ],
  providers: [SubServiciosService],
})
export class SubServiciosModule {}
