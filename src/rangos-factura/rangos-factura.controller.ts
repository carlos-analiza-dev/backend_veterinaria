import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RangosFacturaService } from './rangos-factura.service';
import { CreateRangoFacturaDto } from './dto/create-rango-factura.dto';
import { UpdateRangoFacturaDto } from './dto/update-rango-factura.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('rangos-factura')
export class RangosFacturaController {
  constructor(private readonly rangosFacturaService: RangosFacturaService) {}

  @Post()
  create(@Body() createRangoFacturaDto: CreateRangoFacturaDto) {
    return this.rangosFacturaService.create(createRangoFacturaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.rangosFacturaService.findAll(paginationDto);
  }

  @Get('activo')
  obtenerActivo() {
    return this.rangosFacturaService.obtenerRangoActivo();
  }

  @Get('siguiente-numero')
  obtenerSiguienteNumero() {
    return this.rangosFacturaService.obtenerSiguienteNumero();
  }

  @Post('verificar-vencimientos')
  verificarVencimientos() {
    return this.rangosFacturaService.verificarVencimientos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rangosFacturaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRangoFacturaDto: UpdateRangoFacturaDto,
  ) {
    return this.rangosFacturaService.update(+id, updateRangoFacturaDto);
  }

  @Patch(':id/anular-sobrantes')
  anularSobrantes(@Param('id') id: string) {
    return this.rangosFacturaService.anularFacturasNoUsadas(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rangosFacturaService.remove(+id);
  }
}
