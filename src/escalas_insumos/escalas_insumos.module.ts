import { Module } from '@nestjs/common';
import { EscalasInsumosService } from './escalas_insumos.service';
import { EscalasInsumosController } from './escalas_insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscalasInsumo } from './entities/escalas_insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { EscalasAgroInsumo } from './entities/escalas_agro_insumos.entity';
import { EscalasAgroInsumosService } from './escalas_agro_insumos.service';
import { EscalasAgroInsumosController } from './escalas_agro_insumos.controller';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import { AuditoriaEmpleados } from 'src/empleados-agro/entities/auditoria_empleados.entity';

@Module({
  controllers: [EscalasInsumosController, EscalasAgroInsumosController],
  imports: [
    TypeOrmModule.forFeature([
      EscalasInsumo,
      Insumo,
      Pai,
      Proveedor,
      EscalasAgroInsumo,
      DatosAgroservicio,
      AgroProveedore,
      AgroInsumos,
      AuditoriaEmpleados,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    EscalasInsumosService,
    EscalasAgroInsumosService,
    AgroservicioValidationService,
  ],
})
export class EscalasInsumosModule {}
