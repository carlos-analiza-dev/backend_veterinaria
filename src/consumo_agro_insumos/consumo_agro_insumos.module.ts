import { Module } from '@nestjs/common';
import { ConsumoAgroInsumosService } from './consumo_agro_insumos.service';
import { ConsumoAgroInsumosController } from './consumo_agro_insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumoAgroInsumo } from './entities/consumo_agro_insumo.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { InvLoteAgroInsumo } from 'src/compra-insumos/entities/inv-lote-agro-insumo.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AuditoriaEmpleados } from 'src/empleados-agro/entities/auditoria_empleados.entity';

@Module({
  controllers: [ConsumoAgroInsumosController],
  imports: [
    TypeOrmModule.forFeature([
      ConsumoAgroInsumo,
      AgroInsumos,
      AgroSucursale,
      InvLoteAgroInsumo,
      DatosAgroservicio,
      AuditoriaEmpleados,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [ConsumoAgroInsumosService, AgroservicioValidationService],
})
export class ConsumoAgroInsumosModule {}
