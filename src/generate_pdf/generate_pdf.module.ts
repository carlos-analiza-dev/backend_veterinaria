import { Module } from '@nestjs/common';
import { GeneratePdfService } from './generate_pdf.service';
import { GeneratePdfController } from './generate_pdf.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from 'src/citas/entities/cita.entity';

@Module({
  controllers: [GeneratePdfController],
  imports: [TypeOrmModule.forFeature([Cita])],
  providers: [GeneratePdfService],
})
export class GeneratePdfModule {}
