import { Module } from '@nestjs/common';
import { RolesPermisosAgroService } from './roles-permisos-agro.service';
import { RolesPermisosAgroController } from './roles-permisos-agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesPermisosAgro } from './entities/roles-permisos-agro.entity';

@Module({
  controllers: [RolesPermisosAgroController],
  imports: [TypeOrmModule.forFeature([RolesPermisosAgro])],
  providers: [RolesPermisosAgroService],
})
export class RolesPermisosAgroModule {}
