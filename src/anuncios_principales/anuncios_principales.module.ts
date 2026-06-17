import { Module } from '@nestjs/common';
import { AnunciosPrincipalesService } from './anuncios_principales.service';
import { AnunciosPrincipalesController } from './anuncios_principales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnunciosPrincipale } from './entities/anuncios_principale.entity';
import { ImagesAnunciosService } from 'src/images_anuncios/images_anuncios.service';
import { ImagesAnuncio } from 'src/images_anuncios/entities/images_anuncio.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Pai } from 'src/pais/entities/pai.entity';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [AnunciosPrincipalesController],
  imports: [
    TypeOrmModule.forFeature([AnunciosPrincipale, User, ImagesAnuncio, Pai]),
    AuthModule,
  ],
  providers: [AnunciosPrincipalesService, ImagesAnunciosService],
})
export class AnunciosPrincipalesModule {}
