import { Controller, Post, Body } from '@nestjs/common';
import { DiagnosticoService } from './diagnostico.service';
import { CreateDiagnosticoDto } from './dto/create-diagnostico.dto';
import { CreateConsultaAgricolaDto } from './dto/agricultura-diagnostico.dto';
import { DensidadSiembraDto } from './dto/densidad-siembra.dto';

@Controller('diagnostico')
export class DiagnosticoController {
  constructor(private readonly diagnosticoService: DiagnosticoService) {}

  @Post()
  create(@Body() createDiagnosticoDto: CreateDiagnosticoDto) {
    return this.diagnosticoService.create(createDiagnosticoDto);
  }

  @Post('consulta')
  consultaAgricultura(@Body() dto: CreateConsultaAgricolaDto) {
    return this.diagnosticoService.consulta(dto);
  }

  @Post('densidad-siembra')
  densidadSiembra(@Body() dto: DensidadSiembraDto) {
    return this.diagnosticoService.densidad(dto);
  }
}
