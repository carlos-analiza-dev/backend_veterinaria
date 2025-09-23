import { Module } from '@nestjs/common';
import { ImagesClientService } from './images_client.service';
import { ImagesClientController } from './images_client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesClient } from './entities/images_client.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [ImagesClientController],
  imports: [TypeOrmModule.forFeature([ImagesClient, Cliente])],
  providers: [ImagesClientService],
})
export class ImagesClientModule {}
