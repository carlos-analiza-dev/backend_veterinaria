import { Module } from '@nestjs/common';
import { PermisosClientesAgroService } from './permisos_clientes_agro.service';
import { PermisosClientesAgroController } from './permisos_clientes_agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosClientesAgro } from './entities/permisos_clientes_agro.entity';

@Module({
  controllers: [PermisosClientesAgroController],
  imports: [TypeOrmModule.forFeature([PermisosClientesAgro])],
  providers: [PermisosClientesAgroService],
})
export class PermisosClientesAgroModule {}
