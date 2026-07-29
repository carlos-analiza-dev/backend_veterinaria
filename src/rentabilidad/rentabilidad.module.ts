import { Module } from '@nestjs/common';
import { RentabilidadService } from './rentabilidad.service';
import { RentabilidadController } from './rentabilidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gasto } from 'src/gastos/entities/gasto.entity';
import { Ingreso } from 'src/ingresos/entities/ingreso.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [RentabilidadController],
  imports: [
    TypeOrmModule.forFeature([Gasto, Ingreso, FincasGanadero]),
    AuthClientesModule,
  ],
  providers: [RentabilidadService],
})
export class RentabilidadModule {}
