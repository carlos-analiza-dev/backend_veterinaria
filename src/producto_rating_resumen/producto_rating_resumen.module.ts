import { Module } from '@nestjs/common';
import { ProductoRatingResumenService } from './producto_rating_resumen.service';
import { ProductoRatingResumenController } from './producto_rating_resumen.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoRatingResumen } from './entities/producto_rating_resuman.entity';

@Module({
  controllers: [ProductoRatingResumenController],
  imports: [TypeOrmModule.forFeature([ProductoRatingResumen])],
  providers: [ProductoRatingResumenService],
})
export class ProductoRatingResumenModule {}
