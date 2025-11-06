import { Module } from '@nestjs/common';
import { ProduccionApiculturaService } from './produccion_apicultura.service';
import { ProduccionApiculturaController } from './produccion_apicultura.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionApicultura } from './entities/produccion_apicultura.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Module({
  controllers: [ProduccionApiculturaController],
  imports: [TypeOrmModule.forFeature([ProduccionApicultura, ProduccionFinca])],
  providers: [ProduccionApiculturaService],
})
export class ProduccionApiculturaModule {}
