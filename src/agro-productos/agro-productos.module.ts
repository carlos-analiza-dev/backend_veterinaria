import { Module } from '@nestjs/common';
import { AgroProductosService } from './agro-productos.service';
import { AgroProductosController } from './agro-productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroProducto } from './entities/agro-producto.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { TaxesPai } from 'src/taxes_pais/entities/taxes_pai.entity';
import { TipoProducto } from 'src/tipo_producto/entities/tipo_producto.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AuditoriaProducto } from './entities/auditoria-productos.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { ImagesAgroProductos } from './entities/images-agro-productos.entity';
import { EscalasProductoAgro } from './entities/escalas-agro-producto.entity';
import { DescuentosProductoAgro } from './entities/descuentos-agro-productos.entity';
import { EscalasAgroProductoController } from './escalas-agro-productos.controller';
import { EscalasAgroProductoService } from './escalas-agro-productos.service';
import { DescuentosProductoController } from './descuentos-agro.productos.controller';
import { DescuentoAgroProductoService } from './descuentos-agro-productos.service';

@Module({
  controllers: [
    AgroProductosController,
    EscalasAgroProductoController,
    DescuentosProductoController,
  ],
  imports: [
    TypeOrmModule.forFeature([
      AgroProducto,
      AgroProveedore,
      Categoria,
      Subcategoria,
      TaxesPai,
      TipoProducto,
      Pai,
      Marca,
      DatosAgroservicio,
      AuditoriaProducto,
      ImagesAgroProductos,
      EscalasProductoAgro,
      DescuentosProductoAgro,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    AgroProductosService,
    EscalasAgroProductoService,
    DescuentoAgroProductoService,
    AgroservicioValidationService,
  ],
})
export class AgroProductosModule {}
