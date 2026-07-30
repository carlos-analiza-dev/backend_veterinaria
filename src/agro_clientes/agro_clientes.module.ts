import { Module } from '@nestjs/common';
import { AgroClientesService } from './agro_clientes.service';
import { AgroClientesController } from './agro_clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroCliente } from './entities/agro_cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuditoriaEmpleados } from 'src/empleados-agro/entities/auditoria_empleados.entity';

@Module({
  controllers: [AgroClientesController],
  imports: [
    TypeOrmModule.forFeature([
      AgroCliente,
      Pai,
      DepartamentosPai,
      MunicipiosDepartamentosPai,
      DatosAgroservicio,
      AuditoriaEmpleados,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [AgroClientesService, AgroservicioValidationService],
})
export class AgroClientesModule {}
