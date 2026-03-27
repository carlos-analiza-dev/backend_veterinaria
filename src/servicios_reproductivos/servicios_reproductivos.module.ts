import { Module } from '@nestjs/common';
import { ServiciosReproductivosService } from './servicios_reproductivos.service';
import { ServiciosReproductivosController } from './servicios_reproductivos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioReproductivo } from './entities/servicios_reproductivo.entity';
import { DetalleServicio } from 'src/detalles_servicio_reproductivo/entities/detalles_servicio_reproductivo.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { PartoAnimal } from 'src/parto_animal/entities/parto_animal.entity';

@Module({
  controllers: [ServiciosReproductivosController],
  imports: [
    TypeOrmModule.forFeature([
      ServicioReproductivo,
      DetalleServicio,
      CelosAnimal,
      AnimalFinca,
      FincasGanadero,
      PartoAnimal,
    ]),
    AuthClientesModule,
  ],
  providers: [ServiciosReproductivosService],
})
export class ServiciosReproductivosModule {}
