import { Module } from '@nestjs/common';
import { ProduccionAgricolaService } from './produccion_agricola.service';
import { ProduccionAgricolaController } from './produccion_agricola.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionAgricola } from './entities/produccion_agricola.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Module({
  controllers: [ProduccionAgricolaController],
  imports: [TypeOrmModule.forFeature([ProduccionAgricola, ProduccionFinca])],
  providers: [ProduccionAgricolaService],
})
export class ProduccionAgricolaModule {}
