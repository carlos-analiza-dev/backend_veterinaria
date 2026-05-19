import { Module } from '@nestjs/common';
import { PaquetePaisService } from './paquete_pais.service';
import { PaquetePaisController } from './paquete_pais.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetePais } from './entities/paquete_pai.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Module({
  controllers: [PaquetePaisController],
  imports: [TypeOrmModule.forFeature([PaquetePais, Paquete, Pai])],
  providers: [PaquetePaisService],
})
export class PaquetePaisModule {}
