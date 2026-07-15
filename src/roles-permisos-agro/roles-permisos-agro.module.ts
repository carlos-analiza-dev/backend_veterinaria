import { Module } from '@nestjs/common';
import { RolesPermisosAgroService } from './roles-permisos-agro.service';
import { RolesPermisosAgroController } from './roles-permisos-agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesPermisosAgro } from './entities/roles-permisos-agro.entity';
import { RolesAgro } from 'src/roles-agro/entities/roles-agro.entity';
import { PermisosClientesAgro } from 'src/permisos_clientes_agro/entities/permisos_clientes_agro.entity';

@Module({
  controllers: [RolesPermisosAgroController],
  imports: [
    TypeOrmModule.forFeature([
      RolesPermisosAgro,
      RolesAgro,
      PermisosClientesAgro,
    ]),
  ],
  providers: [RolesPermisosAgroService],
})
export class RolesPermisosAgroModule {}
