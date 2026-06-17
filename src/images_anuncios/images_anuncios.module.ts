import { Module } from '@nestjs/common';
import { ImagesAnunciosService } from './images_anuncios.service';
import { ImagesAnunciosController } from './images_anuncios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesAnuncio } from './entities/images_anuncio.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AnunciosPrincipale } from 'src/anuncios_principales/entities/anuncios_principale.entity';

@Module({
  controllers: [ImagesAnunciosController],
  imports: [
    TypeOrmModule.forFeature([ImagesAnuncio, Cliente, AnunciosPrincipale]),
    AuthClientesModule,
  ],
  providers: [ImagesAnunciosService],
})
export class ImagesAnunciosModule {}
