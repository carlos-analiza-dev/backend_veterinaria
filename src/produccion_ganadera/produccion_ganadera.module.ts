import { Module } from '@nestjs/common';
import { ProduccionGanaderaService } from './produccion_ganadera.service';
import { ProduccionGanaderaController } from './produccion_ganadera.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionGanadera } from './entities/produccion_ganadera.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Module({
  controllers: [ProduccionGanaderaController],
  imports: [TypeOrmModule.forFeature([ProduccionGanadera, ProduccionFinca])],
  providers: [ProduccionGanaderaService],
})
export class ProduccionGanaderaModule {}
