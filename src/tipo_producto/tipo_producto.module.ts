import { Module } from '@nestjs/common';
import { TipoProductoService } from './tipo_producto.service';
import { TipoProductoController } from './tipo_producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoProducto } from './entities/tipo_producto.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TipoProductoController],
  imports: [
    TypeOrmModule.forFeature([TipoProducto, Subcategoria, User]),
    AuthModule,
  ],
  providers: [TipoProductoService],
})
export class TipoProductoModule {}
