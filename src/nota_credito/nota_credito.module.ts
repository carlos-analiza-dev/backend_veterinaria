import { Module } from '@nestjs/common';
import { NotaCreditoService } from './nota_credito.service';
import { NotaCreditoController } from './nota_credito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaCredito } from './entities/nota_credito.entity';
import { DetallesNotaCredito } from 'src/detalles_nota_credito/entities/detalles_nota_credito.entity';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { MovimientosLote } from 'src/movimientos_lotes/entities/movimientos_lote.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { AgroNotaCredito } from './entities/nota_agro_credito.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { NotaCreditoAgroService } from './nota_credito_agro.service';
import { NotaCreditoAgroController } from './nota_credito_agro.controller';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { DetallesAgroNotaCredito } from 'src/detalles_nota_credito/entities/detalles_agro_nota_credito.entity';
import { AgroMovimientosLote } from 'src/movimientos_lotes/entities/agro_movimientos_lotes.entity';
import { AuditoriaEmpleados } from 'src/empleados-agro/entities/auditoria_empleados.entity';

@Module({
  controllers: [NotaCreditoController, NotaCreditoAgroController],
  imports: [
    TypeOrmModule.forFeature([
      NotaCredito,
      DetallesNotaCredito,
      FacturaEncabezado,
      Lote,
      SubServicio,
      MovimientosLote,
      User,
      AgroNotaCredito,
      DatosAgroservicio,
      AgroMovimientosLote,
      DetallesAgroNotaCredito,
      AuditoriaEmpleados,
    ]),
    AuthModule,
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    NotaCreditoService,
    NotaCreditoAgroService,
    AgroservicioValidationService,
  ],
})
export class NotaCreditoModule {}
