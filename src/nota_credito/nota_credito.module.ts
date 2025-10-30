import { Module } from '@nestjs/common';
import { NotaCreditoService } from './nota_credito.service';
import { NotaCreditoController } from './nota_credito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaCredito } from './entities/nota_credito.entity';
import { DetallesNotaCredito } from 'src/detalles_nota_credito/entities/detalles_nota_credito.entity';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { MovimientosLote } from 'src/movimientos_lotes/entities/movimientos_lote.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [NotaCreditoController],
  imports: [
    TypeOrmModule.forFeature([
      NotaCredito,
      DetallesNotaCredito,
      FacturaEncabezado,
      Lote,
      SubServicio,
      MovimientosLote,
      User,
    ]),
    AuthModule,
  ],
  providers: [NotaCreditoService],
})
export class NotaCreditoModule {}
