import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Insumo } from './entities/insumo.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { CitaInsumo } from 'src/cita_insumos/entities/cita_insumo.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [InsumosController],
  imports: [
    TypeOrmModule.forFeature([Insumo, Inventario, Proveedor, Marca, Pai, User]),
    AuthModule,
  ],
  providers: [InsumosService],
})
export class InsumosModule {}
