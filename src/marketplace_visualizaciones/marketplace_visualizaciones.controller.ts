import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MarketplaceVisualizacionesService } from './marketplace_visualizaciones.service';
import { CreateMarketplaceVisualizacioneDto } from './dto/create-marketplace_visualizacione.dto';
import { UpdateMarketplaceVisualizacioneDto } from './dto/update-marketplace_visualizacione.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('marketplace-visualizaciones')
export class MarketplaceVisualizacionesController {
  constructor(
    private readonly marketplaceVisualizacionesService: MarketplaceVisualizacionesService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body()
    createMarketplaceVisualizacioneDto: CreateMarketplaceVisualizacioneDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.marketplaceVisualizacionesService.create(
      createMarketplaceVisualizacioneDto,
      cliente,
    );
  }

  @Get()
  findAll() {
    return this.marketplaceVisualizacionesService.findAll();
  }

  @Get(':publicacionId')
  @AuthCliente()
  findByPublicacion(@Param('publicacionId') publicacionId: string) {
    return this.marketplaceVisualizacionesService.findByPublicacion(
      publicacionId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateMarketplaceVisualizacioneDto: UpdateMarketplaceVisualizacioneDto,
  ) {
    return this.marketplaceVisualizacionesService.update(
      +id,
      updateMarketplaceVisualizacioneDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketplaceVisualizacionesService.remove(+id);
  }
}
