import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosLote } from './entities/movimientos_lote.entity';

@Module({
  controllers: [],
  imports: [TypeOrmModule.forFeature([MovimientosLote])],
  providers: [],
})
export class MovimientosLotesModule {}
