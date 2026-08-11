import { Module } from '@nestjs/common';
import { PermisosClientesAgroService } from './permisos_clientes_agro.service';
import { PermisosClientesAgroController } from './permisos_clientes_agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosClientesAgro } from './entities/permisos_clientes_agro.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';

@Module({
  controllers: [PermisosClientesAgroController],
  imports: [
    TypeOrmModule.forFeature([PermisosClientesAgro, DatosAgroservicio]),
    AuthClientesModule,
  ],
  providers: [PermisosClientesAgroService, AgroservicioValidationService],
})
export class PermisosClientesAgroModule {}
