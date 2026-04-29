import { Module } from '@nestjs/common';
import { ActividadFotosService } from './actividad_fotos.service';
import { ActividadFotosController } from './actividad_fotos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadFoto } from './entities/actividad_foto.entity';
import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';

@Module({
  controllers: [ActividadFotosController],
  imports: [TypeOrmModule.forFeature([ActividadFoto, ActividadesDiaria])],
  providers: [ActividadFotosService],
})
export class ActividadFotosModule {}
