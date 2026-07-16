import { Module } from '@nestjs/common';
import { EmpleadosAgroService } from './empleados-agro.service';
import { EmpleadosAgroController } from './empleados-agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosAgro } from './entities/empleados-agro.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { RolesAgro } from 'src/roles-agro/entities/roles-agro.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { ValidationService } from 'src/validations/validation-uniques.service';

@Module({
  controllers: [EmpleadosAgroController],
  imports: [
    TypeOrmModule.forFeature([
      EmpleadosAgro,
      AgroSucursale,
      Pai,
      DepartamentosPai,
      MunicipiosDepartamentosPai,
      RolesAgro,
      Cliente,
      User,
      DatosAgroservicio,
    ]),
    AuthClientesModule,
  ],

  providers: [EmpleadosAgroService, ValidationService],
})
export class EmpleadosAgroModule {}
