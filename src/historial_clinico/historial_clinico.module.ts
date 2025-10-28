import { Module } from '@nestjs/common';
import { HistorialClinicoService } from './historial_clinico.service';
import { HistorialClinicoController } from './historial_clinico.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialClinico } from './entities/historial_clinico.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [HistorialClinicoController],
  imports: [
    TypeOrmModule.forFeature([
      HistorialClinico,
      AnimalFinca,
      Cita,
      SubServicio,
      User,
    ]),
    AuthModule,
  ],
  providers: [HistorialClinicoService],
})
export class HistorialClinicoModule {}
