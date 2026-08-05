import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { AgroInsumos } from './entities/agro_insumos.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AuditoriaEmpleados } from 'src/empleados-agro/entities/auditoria_empleados.entity';
import { AgroInsumosController } from './agro_insumos.controller';
import { AgroInsumosService } from './agro_insumos.service';

@Module({
  controllers: [InsumosController, AgroInsumosController],
  imports: [
    TypeOrmModule.forFeature([
      Insumo,
      Inventario,
      Proveedor,
      Marca,
      Pai,
      User,
      AgroInsumos,
      DatosAgroservicio,
      AgroProveedore,
      AuditoriaEmpleados,
    ]),
    AuthModule,
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    InsumosService,
    AgroInsumosService,
    AgroservicioValidationService,
  ],
})
export class InsumosModule {}
