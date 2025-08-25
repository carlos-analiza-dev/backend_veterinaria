import { Module } from '@nestjs/common';
import { SubServiciosService } from './sub_servicios.service';
import { SubServiciosController } from './sub_servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubServicio } from './entities/sub_servicio.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';

@Module({
  controllers: [SubServiciosController],
  imports: [
    TypeOrmModule.forFeature([
      SubServicio,
      Servicio,
      Pai,
      InventarioProducto,
      Proveedor,
      Marca,
      Categoria,
      ServiciosPai,
    ]),
  ],
  providers: [SubServiciosService],
})
export class SubServiciosModule {}
