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
import { HistorialDetalle } from 'src/historial_detalles/entities/historial_detalle.entity';
import { HistorialDocumento } from 'src/historial_documentos/entities/historial_documento.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [HistorialClinicoController],
  imports: [
    TypeOrmModule.forFeature([
      HistorialClinico,
      AnimalFinca,
      Cita,
      SubServicio,
      User,
      HistorialDetalle,
      HistorialDocumento,
      Cliente,
    ]),
    AuthModule,
    AuthClientesModule,
  ],
  providers: [HistorialClinicoService],
})
export class HistorialClinicoModule {}
