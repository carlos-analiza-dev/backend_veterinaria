import { Module } from '@nestjs/common';
import { AgroSucursalesService } from './agro-sucursales.service';
import { AgroSucursalesController } from './agro-sucursales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroSucursale } from './entities/agro-sucursale.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { ClientePaquetesService } from 'src/cliente_paquetes/cliente_paquetes.service';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';

@Module({
  controllers: [AgroSucursalesController],
  imports: [
    TypeOrmModule.forFeature([
      AgroSucursale,
      EmpleadosAgro,
      MunicipiosDepartamentosPai,
      DepartamentosPai,
      Pai,
      DatosAgroservicio,
      Cliente,
      EmpleadosAgro,
      ClientePaquete,
      Paquete,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    AgroSucursalesService,
    AgroservicioValidationService,
    ClientePaquetesService,
  ],
})
export class AgroSucursalesModule {}
