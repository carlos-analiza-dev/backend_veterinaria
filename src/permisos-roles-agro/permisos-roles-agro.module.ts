import { Module } from '@nestjs/common';
import { PermisosRolesAgroService } from './permisos-roles-agro.service';
import { PermisosRolesAgroController } from './permisos-roles-agro.controller';

@Module({
  controllers: [PermisosRolesAgroController],
  providers: [PermisosRolesAgroService],
})
export class PermisosRolesAgroModule {}
