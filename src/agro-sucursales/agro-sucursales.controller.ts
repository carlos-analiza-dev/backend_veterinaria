import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgroSucursalesService } from './agro-sucursales.service';
import { CreateAgroSucursaleDto } from './dto/create-agro-sucursale.dto';
import { UpdateAgroSucursaleDto } from './dto/update-agro-sucursale.dto';

@Controller('agro-sucursales')
export class AgroSucursalesController {
  constructor(private readonly agroSucursalesService: AgroSucursalesService) {}

  @Post()
  create(@Body() createAgroSucursaleDto: CreateAgroSucursaleDto) {
    return this.agroSucursalesService.create(createAgroSucursaleDto);
  }

  @Get()
  findAll() {
    return this.agroSucursalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroSucursalesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgroSucursaleDto: UpdateAgroSucursaleDto) {
    return this.agroSucursalesService.update(+id, updateAgroSucursaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroSucursalesService.remove(+id);
  }
}
