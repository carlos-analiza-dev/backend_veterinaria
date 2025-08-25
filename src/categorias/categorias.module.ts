import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CategoriasController],
  imports: [TypeOrmModule.forFeature([Categoria, User]), AuthModule],
  providers: [CategoriasService],
  exports: [CategoriasService, TypeOrmModule],
})
export class CategoriasModule {}
