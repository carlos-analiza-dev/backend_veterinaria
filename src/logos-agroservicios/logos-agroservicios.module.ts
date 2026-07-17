import { Module } from '@nestjs/common';
import { LogosAgroserviciosService } from './logos-agroservicios.service';
import { LogosAgroserviciosController } from './logos-agroservicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogosAgroservicio } from './entities/logos-agroservicio.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [LogosAgroserviciosController],
  imports: [
    TypeOrmModule.forFeature([LogosAgroservicio, DatosAgroservicio]),
    CommonModule,
  ],
  providers: [LogosAgroserviciosService],
})
export class LogosAgroserviciosModule {}
