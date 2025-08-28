import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotesService } from './lotes.service';
import { LotesController } from './lotes.controller';
import { Lote } from './entities/lote.entity';
import { User } from 'src/auth/entities/auth.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lote, User, Insumo, Proveedor]),
    AuthModule,
  ],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService, TypeOrmModule],
})
export class LotesModule {}