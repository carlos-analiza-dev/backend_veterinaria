import { Module } from '@nestjs/common';
import { DescuentosClientesService } from './descuentos_clientes.service';
import { DescuentosClientesController } from './descuentos_clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DescuentosCliente } from './entities/descuentos_cliente.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { DescuentosAgroClientesService } from './descuentos-agro-clientes.service';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { DescuentosAgroCliente } from './entities/descuentos_clientes_agro.entity';
import { DescuentosAgroClientesController } from './descuentos_agro_clientes.controller';
import { AuditoriaEmpleados } from 'src/empleados-agro/entities/auditoria_empleados.entity';

@Module({
  controllers: [DescuentosClientesController, DescuentosAgroClientesController],
  imports: [
    TypeOrmModule.forFeature([
      DescuentosCliente,
      DatosAgroservicio,
      DescuentosAgroCliente,
      AuditoriaEmpleados,
    ]),
    AuthModule,
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    DescuentosClientesService,
    DescuentosAgroClientesService,
    AgroservicioValidationService,
  ],
})
export class DescuentosClientesModule {}
