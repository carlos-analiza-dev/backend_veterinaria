import { Module } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Medico } from 'src/medicos/entities/medico.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { HorariosMedico } from 'src/horarios_medicos/entities/horarios_medico.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { MailService } from 'src/mail/mail.service';
import { CitaInsumo } from 'src/cita_insumos/entities/cita_insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { CitaProducto } from 'src/cita_productos/entities/cita_producto.entity';
import { Cliente } from '../auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [CitasController],
  imports: [
    TypeOrmModule.forFeature([
      Cita,
      Medico,
      FincasGanadero,
      HorariosMedico,
      AnimalFinca,
      SubServicio,
      Cliente,
      CitaInsumo,
      Insumo,
      Inventario,
      CitaProducto,
    ]),
  ],
  providers: [CitasService, MailService],
})
export class CitasModule {}
