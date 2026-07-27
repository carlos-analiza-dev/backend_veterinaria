import { Module } from '@nestjs/common';
import { MovimientosInventarioService } from './movimientos_inventario.service';
import { MovimientosInventarioController } from './movimientos_inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInventario } from './entities/movimientos_inventario.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { AgroMovimientosInventario } from './entities/agro-movimientos-inventario.entity';
import { AuditoriaMovimientosAgro } from './entities/audit-movimientos-agro.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';

@Module({
  controllers: [MovimientosInventarioController],
  imports: [
    TypeOrmModule.forFeature([
      MovimientosInventario,
      Lote,
      Sucursal,
      User,
      AgroMovimientosInventario,
      AuditoriaMovimientosAgro,
      DatosAgroservicio,
    ]),
    AuthModule,
  ],
  providers: [MovimientosInventarioService, AgroservicioValidationService],
})
export class MovimientosInventarioModule {}
