import { Module } from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medico } from './entities/medico.entity';
import { User } from 'src/auth/entities/auth.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { HorariosMedico } from 'src/horarios_medicos/entities/horarios_medico.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MedicosController],
  imports: [
    TypeOrmModule.forFeature([
      Medico,
      User,
      SubServicio,
      Cita,
      HorariosMedico,
      User,
    ]),
    AuthModule,
  ],
  providers: [MedicosService],
})
export class MedicosModule {}
