import { Module } from '@nestjs/common';
import { AgroComprasProductosService } from './agro-compras-productos.service';
import { AgroComprasProductosController } from './agro-compras-productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroComprasProducto } from './entities/agro-compras-producto.entity';
import { CompraDetalleAgroProducto } from './entities/compra-detalle-agro-producto.entity';
import { LoteAgroProducto } from './entities/lote-agro-compra.entity';
import { AuditoriaCompra } from './entities/audit-compras-agro-productos.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroProductosController } from './lotes-agro-productos.controller';
import { LotesAgroProductosService } from './lotes-agro-productos.service';

@Module({
  controllers: [AgroComprasProductosController, AgroProductosController],
  imports: [
    TypeOrmModule.forFeature([
      AgroComprasProducto,
      CompraDetalleAgroProducto,
      LoteAgroProducto,
      AuditoriaCompra,
      AgroSucursale,
      AgroProveedore,
      DatosAgroservicio,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    AgroComprasProductosService,
    AgroservicioValidationService,
    LotesAgroProductosService,
  ],
})
export class AgroComprasProductosModule {}
