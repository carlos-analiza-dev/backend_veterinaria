import { Module } from '@nestjs/common';
import { ProduccionFincaService } from './produccion_finca.service';
import { ProduccionFincaController } from './produccion_finca.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionFinca } from './entities/produccion_finca.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ProduccionAgricola } from 'src/produccion_agricola/entities/produccion_agricola.entity';
import { ProduccionGanadera } from 'src/produccion_ganadera/entities/produccion_ganadera.entity';
import { ProduccionAlternativa } from 'src/produccion_alternativa/entities/produccion_alternativa.entity';
import { ProduccionForrajesInsumo } from 'src/produccion_forrajes_insumos/entities/produccion_forrajes_insumo.entity';
import { User } from 'src/auth/entities/auth.entity';
import { ProduccionApicultura } from 'src/produccion_apicultura/entities/produccion_apicultura.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [ProduccionFincaController],
  imports: [
    TypeOrmModule.forFeature([
      ProduccionFinca,
      FincasGanadero,
      ProduccionAgricola,
      ProduccionGanadera,
      ProduccionAlternativa,
      ProduccionForrajesInsumo,
      ProduccionApicultura,
      User,
      Cliente,
    ]),
  ],
  providers: [ProduccionFincaService],
})
export class ProduccionFincaModule {}
