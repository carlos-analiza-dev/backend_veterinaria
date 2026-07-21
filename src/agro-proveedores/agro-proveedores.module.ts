import { Module } from '@nestjs/common';
import { AgroProveedoresService } from './agro-proveedores.service';
import { AgroProveedoresController } from './agro-proveedores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroProveedore } from './entities/agro-proveedore.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { AuditoriaProveedor } from './entities/auditoria_proveedores.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';

@Module({
  controllers: [AgroProveedoresController],
  imports: [
    TypeOrmModule.forFeature([
      AgroProveedore,
      Pai,
      DepartamentosPai,
      MunicipiosDepartamentosPai,
      EmpleadosAgro,
      AuditoriaProveedor,
      DatosAgroservicio,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [AgroProveedoresService, AgroservicioValidationService],
})
export class AgroProveedoresModule {}
