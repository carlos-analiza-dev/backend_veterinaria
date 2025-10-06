import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FacturaEncabezadoService } from './factura_encabezado.service';
import { CreateFacturaEncabezadoDto } from './dto/create-factura_encabezado.dto';
import { UpdateFacturaEncabezadoDto } from './dto/update-factura_encabezado.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('factura-encabezado')
export class FacturaEncabezadoController {
  constructor(
    private readonly facturaEncabezadoService: FacturaEncabezadoService,
  ) {}

  @Post()
  @Auth()
  create(@Body() createFacturaEncabezadoDto: CreateFacturaEncabezadoDto) {
    return this.facturaEncabezadoService.create(createFacturaEncabezadoDto);
  }

  @Get()
  findAll() {
    return this.facturaEncabezadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturaEncabezadoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacturaEncabezadoDto: UpdateFacturaEncabezadoDto,
  ) {
    return this.facturaEncabezadoService.update(
      +id,
      updateFacturaEncabezadoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturaEncabezadoService.remove(+id);
  }
}
