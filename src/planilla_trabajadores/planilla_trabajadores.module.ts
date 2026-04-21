import { Module } from '@nestjs/common';
import { PlanillaTrabajadoresService } from './planilla_trabajadores.service';
import { PlanillaTrabajadoresController } from './planilla_trabajadores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanillaTrabajadore } from './entities/planilla_trabajadore.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { DetallePlanillaTrabajadore } from 'src/detalle_planilla_trabajadores/entities/detalle_planilla_trabajadore.entity';
import { ConfiguracionTrabajadore } from 'src/configuracion_trabajadores/entities/configuracion_trabajadore.entity';
import { JornadaTrabajadore } from 'src/jornada_trabajadores/entities/jornada_trabajadore.entity';

@Module({
  controllers: [PlanillaTrabajadoresController],
  imports: [
    TypeOrmModule.forFeature([
      PlanillaTrabajadore,
      Cliente,
      DetallePlanillaTrabajadore,
      ConfiguracionTrabajadore,
      JornadaTrabajadore,
    ]),
  ],
  providers: [PlanillaTrabajadoresService],
})
export class PlanillaTrabajadoresModule {}
