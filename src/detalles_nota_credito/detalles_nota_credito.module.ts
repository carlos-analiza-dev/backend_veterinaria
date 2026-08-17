import { Module } from '@nestjs/common';
import { DetallesNotaCreditoService } from './detalles_nota_credito.service';
import { DetallesNotaCreditoController } from './detalles_nota_credito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesNotaCredito } from './entities/detalles_nota_credito.entity';
import { DetallesAgroNotaCredito } from './entities/detalles_agro_nota_credito.entity';

@Module({
  controllers: [DetallesNotaCreditoController],
  imports: [
    TypeOrmModule.forFeature([DetallesNotaCredito, DetallesAgroNotaCredito]),
  ],
  providers: [DetallesNotaCreditoService],
})
export class DetallesNotaCreditoModule {}
