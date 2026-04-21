import { Module } from '@nestjs/common';
import { DetallePlanillaTrabajadoresService } from './detalle_planilla_trabajadores.service';
import { DetallePlanillaTrabajadoresController } from './detalle_planilla_trabajadores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallePlanillaTrabajadore } from './entities/detalle_planilla_trabajadore.entity';
import { PlanillaTrabajadore } from 'src/planilla_trabajadores/entities/planilla_trabajadore.entity';

@Module({
  controllers: [DetallePlanillaTrabajadoresController],
  imports: [
    TypeOrmModule.forFeature([DetallePlanillaTrabajadore, PlanillaTrabajadore]),
  ],
  providers: [DetallePlanillaTrabajadoresService],
})
export class DetallePlanillaTrabajadoresModule {}
