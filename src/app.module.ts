import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PaisModule } from './pais/pais.module';
import { MailModule } from './mail/mail.module';
import { CommonModule } from './common/common.module';
import { DepartamentosPaisModule } from './departamentos_pais/departamentos_pais.module';
import { MunicipiosDepartamentosPaisModule } from './municipios_departamentos_pais/municipios_departamentos_pais.module';
import { ServiciosPaisModule } from './servicios_pais/servicios_pais.module';
import { ServiciosModule } from './servicios/servicios.module';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { FincasGanaderoModule } from './fincas_ganadero/fincas_ganadero.module';
import { AnimalFincaModule } from './animal_finca/animal_finca.module';
import { EspecieAnimalModule } from './especie_animal/especie_animal.module';
import { RazaAnimalModule } from './raza_animal/raza_animal.module';
import { SubServiciosModule } from './sub_servicios/sub_servicios.module';
import { CitasModule } from './citas/citas.module';
import { MedicosModule } from './medicos/medicos.module';
import { HorariosMedicosModule } from './horarios_medicos/horarios_medicos.module';
import { ProfileImagesModule } from './profile_images/profile_images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImagesAminalesModule } from './images_aminales/images_aminales.module';
import { InsumosUsuarioModule } from './insumos_usuario/insumos_usuario.module';
import { AnalisisUsuarioModule } from './analisis_usuario/analisis_usuario.module';
import { ProduccionFincaModule } from './produccion_finca/produccion_finca.module';
import { ProduccionGanaderaModule } from './produccion_ganadera/produccion_ganadera.module';
import { ProduccionAgricolaModule } from './produccion_agricola/produccion_agricola.module';
import { ProduccionForrajesInsumosModule } from './produccion_forrajes_insumos/produccion_forrajes_insumos.module';
import { ProduccionAlternativaModule } from './produccion_alternativa/produccion_alternativa.module';
import { ProduccionApiculturaModule } from './produccion_apicultura/produccion_apicultura.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { MarcasModule } from './marcas/marcas.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SubcategoriasModule } from './subcategorias/subcategorias.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { InventarioModule } from './inventario/inventario.module';
import { InsumosModule } from './insumos/insumos.module';
import { TaxesPaisModule } from './taxes_pais/taxes_pais.module';
import { ProductosImagesModule } from './productos_images/productos_images.module';
import { LotesModule } from './lotes/lotes.module';
import { ComprasModule } from './compras/compras.module';
import { CompraInsumosModule } from './compra-insumos/compra-insumos.module';
import { DatosProductosModule } from './datos-productos/datos-productos.module';
import { EscalasProductoModule } from './escalas_producto/escalas_producto.module';
import { DescuentosProductoModule } from './descuentos_producto/descuentos_producto.module';
import { DescuentosInsumosModule } from './descuentos_insumos/descuentos_insumos.module';
import { EscalasInsumosModule } from './escalas_insumos/escalas_insumos.module';
import { AuthClientesModule } from './auth-clientes/auth-clientes.module';
import { ImagesClientModule } from './images_client/images_client.module';
import { DatosEmpresaModule } from './datos-empresa/datos-empresa.module';
import { RangosFacturaModule } from './rangos-factura/rangos-factura.module';
import { GeneratePdfModule } from './generate_pdf/generate_pdf.module';
import { CitaProductosModule } from './cita_productos/cita_productos.module';
import { FacturaEncabezadoModule } from './factura_encabezado/factura_encabezado.module';
import { FacturaDetalleModule } from './factura_detalle/factura_detalle.module';
import { GeneratePdfFacturaModule } from './generate_pdf_factura/generate_pdf_factura.module';
import { DescuentosClientesModule } from './descuentos_clientes/descuentos_clientes.module';
import { MovimientosLotesModule } from './movimientos_lotes/movimientos_lotes.module';
import { ProductosNoVendidosModule } from './productos_no_vendidos/productos_no_vendidos.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { GenerateFacturaTermicaModule } from './generate_factura_termica/generate_factura_termica.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PedidoDetallesModule } from './pedido_detalles/pedido_detalles.module';
import { CitaInsumosModule } from './cita_insumos/cita_insumos.module';
import { HistorialClinicoModule } from './historial_clinico/historial_clinico.module';
import { HistorialDetallesModule } from './historial_detalles/historial_detalles.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: +process.env.DB_PORT,
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    PaisModule,
    MailModule,
    CommonModule,
    DepartamentosPaisModule,
    MunicipiosDepartamentosPaisModule,
    ServiciosPaisModule,
    ServiciosModule,
    RolesModule,
    SeedModule,
    FincasGanaderoModule,
    AnimalFincaModule,
    EspecieAnimalModule,
    RazaAnimalModule,
    SubServiciosModule,
    CitasModule,
    MedicosModule,
    GeneratePdfModule,
    CitaProductosModule,
    CitaInsumosModule,
    HorariosMedicosModule,

    ProfileImagesModule,

    ImagesAminalesModule,

    InsumosUsuarioModule,

    AnalisisUsuarioModule,
    InventarioModule,

    ProduccionFincaModule,

    ProduccionGanaderaModule,

    ProduccionAgricolaModule,

    ProduccionForrajesInsumosModule,

    InsumosModule,

    ProduccionAlternativaModule,

    ProduccionApiculturaModule,

    ProveedoresModule,

    MarcasModule,

    CategoriasModule,
    SubcategoriasModule,

    SucursalesModule,

    TaxesPaisModule,

    ProductosImagesModule,
    LotesModule,

    ComprasModule,
    CompraInsumosModule,
    DatosProductosModule,

    InsumosModule,

    EscalasProductoModule,

    DescuentosProductoModule,

    DescuentosInsumosModule,

    EscalasInsumosModule,

    AuthClientesModule,

    ImagesClientModule,

    DatosEmpresaModule,

    RangosFacturaModule,

    FacturaEncabezadoModule,

    FacturaDetalleModule,

    GeneratePdfFacturaModule,

    DescuentosClientesModule,

    MovimientosLotesModule,

    ProductosNoVendidosModule,

    DashboardsModule,

    GenerateFacturaTermicaModule,

    GoogleMapsModule,

    PedidosModule,

    PedidoDetallesModule,

    HistorialClinicoModule,

    HistorialDetallesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
