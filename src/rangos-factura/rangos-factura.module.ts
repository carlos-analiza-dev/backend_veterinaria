import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RangosFacturaService } from './rangos-factura.service';
import { RangosFacturaController } from './rangos-factura.controller';
import { RangoFactura } from './entities/rango-factura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RangoFactura])],
  providers: [RangosFacturaService],
  controllers: [RangosFacturaController],
  exports: [RangosFacturaService],
})
export class RangosFacturaModule {}
