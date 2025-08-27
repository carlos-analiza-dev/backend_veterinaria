import { Module } from '@nestjs/common';
import { TaxesPaisService } from './taxes_pais.service';
import { TaxesPaisController } from './taxes_pais.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxesPai } from './entities/taxes_pai.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [TaxesPaisController],
  imports: [TypeOrmModule.forFeature([TaxesPai, Pai, User]), AuthModule],
  providers: [TaxesPaisService],
})
export class TaxesPaisModule {}
