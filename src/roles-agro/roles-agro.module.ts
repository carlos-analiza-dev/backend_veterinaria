import { Module } from '@nestjs/common';
import { RolesAgroService } from './roles-agro.service';
import { RolesAgroController } from './roles-agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesAgro } from './entities/roles-agro.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RolesAgroController],
  imports: [TypeOrmModule.forFeature([RolesAgro, User]), AuthModule],
  providers: [RolesAgroService],
})
export class RolesAgroModule {}
