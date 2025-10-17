import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosLote } from './entities/movimientos_lote.entity';
import { MovimientosLoteController } from './movimientos_lote.controller';
import { MovimientosLoteService } from './movimientos_lote.service';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientosLote, User]), AuthModule],
  controllers: [MovimientosLoteController],
  providers: [MovimientosLoteService],
})
export class MovimientosLotesModule {}
