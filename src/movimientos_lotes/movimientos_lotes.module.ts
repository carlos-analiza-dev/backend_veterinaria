import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosLote } from './entities/movimientos_lote.entity';
import { MovimientosLoteController } from './movimientos_lote.controller';
import { MovimientosLoteService } from './movimientos_lote.service';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { AgroMovimientosLote } from './entities/agro_movimientos_lotes.entity';
import { MovimientosAgroLoteController } from './movimientos_agro_lotes.controller';
import { MovimientosAgroLoteService } from './movimientos_agro_lotes.service';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientosLote,
      User,
      AgroMovimientosLote,
      DatosAgroservicio,
    ]),
    AuthModule,
  ],
  controllers: [MovimientosLoteController, MovimientosAgroLoteController],
  providers: [
    MovimientosLoteService,
    MovimientosAgroLoteService,
    AgroservicioValidationService,
  ],
})
export class MovimientosLotesModule {}
