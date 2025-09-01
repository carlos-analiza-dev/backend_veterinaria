import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { Role } from 'src/roles/entities/role.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { ConfigModule } from '@nestjs/config';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';

@Module({
  controllers: [SeedController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      DepartamentosPai,
      MunicipiosDepartamentosPai,
      Pai,
      RazaAnimal,
      EspecieAnimal,
      Sucursal,
      Role,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
