import { Module } from '@nestjs/common';
import { PesoHistorialService } from './peso_historial.service';
import { PesoHistorialController } from './peso_historial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PesoHistorial } from './entities/peso_historial.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';

@Module({
  controllers: [PesoHistorialController],
  imports: [TypeOrmModule.forFeature([PesoHistorial, AnimalFinca])],
  providers: [PesoHistorialService],
})
export class PesoHistorialModule {}
