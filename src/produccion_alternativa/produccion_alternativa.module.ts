import { Module } from '@nestjs/common';
import { ProduccionAlternativaService } from './produccion_alternativa.service';
import { ProduccionAlternativaController } from './produccion_alternativa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionAlternativa } from './entities/produccion_alternativa.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Module({
  controllers: [ProduccionAlternativaController],
  imports: [TypeOrmModule.forFeature([ProduccionAlternativa, ProduccionFinca])],
  providers: [ProduccionAlternativaService],
})
export class ProduccionAlternativaModule {}
