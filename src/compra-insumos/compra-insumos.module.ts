import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompraInsumosService } from './compra-insumos.service';
import { CompraInsumosController } from './compra-insumos.controller';
import { CompraInsumo } from './entities/compra-insumo.entity';
import { DetalleCompraInsumo } from './entities/detalle-compra-insumo.entity';
import { InvLoteInsumo } from './entities/inv-lote-insumo.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { AuthModule } from '../auth/auth.module';
import { DetalleCompraAgroInsumo } from './entities/detalle-compra-agro-insumo.entity';
import { CompraAgroInsumo } from './entities/compra-agro-insumo.entity';
import { InvLoteAgroInsumo } from './entities/inv-lote-agro-insumo.entity';
import { CompraAgroInsumosService } from './compra-agro-insumo.service';
import { CompraAgroInsumosController } from './compra-agro-insumo.controller';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuditoriaEmpleados } from 'src/empleados-agro/entities/auditoria_empleados.entity';
import { LotesAgroInsumosService } from './lotes-agro-insumos.service';
import { LotesAgroInsumosController } from './lotes-agro-insumos.controller';

@Module({
  controllers: [
    CompraInsumosController,
    CompraAgroInsumosController,
    LotesAgroInsumosController,
  ],
  providers: [
    CompraInsumosService,
    CompraAgroInsumosService,
    LotesAgroInsumosService,
    AgroservicioValidationService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      CompraInsumo,
      DetalleCompraInsumo,
      InvLoteInsumo,
      Sucursal,
      Proveedor,
      Insumo,
      DetalleCompraAgroInsumo,
      CompraAgroInsumo,
      InvLoteAgroInsumo,
      AgroSucursale,
      AgroProveedore,
      AgroInsumos,
      DatosAgroservicio,
      AuditoriaEmpleados,
    ]),
    AuthModule,
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  exports: [CompraInsumosService, TypeOrmModule],
})
export class CompraInsumosModule {}
