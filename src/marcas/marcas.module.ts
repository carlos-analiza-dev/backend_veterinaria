import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marca } from './entities/marca.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MarcasController],
  imports: [TypeOrmModule.forFeature([Marca, User]), AuthModule],
  providers: [MarcasService],
  exports: [MarcasService, TypeOrmModule],
})
export class MarcasModule {}
