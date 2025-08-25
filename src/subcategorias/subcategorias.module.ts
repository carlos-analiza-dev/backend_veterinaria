import { Module } from '@nestjs/common';
import { SubcategoriasService } from './subcategorias.service';
import { SubcategoriasController } from './subcategorias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategoria } from './entities/subcategoria.entity';
import { User } from 'src/auth/entities/auth.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [SubcategoriasController],
  imports: [
    TypeOrmModule.forFeature([Subcategoria, User, Categoria]),
    AuthModule,
  ],
  providers: [SubcategoriasService],
  exports: [SubcategoriasService, TypeOrmModule],
})
export class SubcategoriasModule {}
