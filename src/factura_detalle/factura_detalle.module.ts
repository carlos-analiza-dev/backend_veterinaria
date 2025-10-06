import { Module } from '@nestjs/common';
import { FacturaDetalleService } from './factura_detalle.service';
import { FacturaDetalleController } from './factura_detalle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaDetalle } from './entities/factura_detalle.entity';

@Module({
  controllers: [FacturaDetalleController],
  imports: [TypeOrmModule.forFeature([FacturaDetalle])],
  providers: [FacturaDetalleService],
})
export class FacturaDetalleModule {}
