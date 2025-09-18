import { Module } from '@nestjs/common';
import { ImagesAminalesService } from './images_aminales.service';
import { ImagesAminalesController } from './images_aminales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesAminale } from './entities/images_aminale.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [ImagesAminalesController],
  imports: [
    TypeOrmModule.forFeature([ImagesAminale, AnimalFinca]),
    ConfigModule,
    AuthClientesModule,
  ],
  providers: [ImagesAminalesService],
})
export class ImagesAminalesModule {}
