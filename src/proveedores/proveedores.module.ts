import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { User } from 'src/auth/entities/auth.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProveedoresController],
  imports: [
    TypeOrmModule.forFeature([
      Proveedor,
      User,
      Pai,
      DepartamentosPai,
      MunicipiosDepartamentosPai,
    ]),
    AuthModule,
  ],
  providers: [ProveedoresService],
  exports: [ProveedoresService, TypeOrmModule],
})
export class ProveedoresModule {}
