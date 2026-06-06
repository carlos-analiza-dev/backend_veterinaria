import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { MarketplaceAnimalesService } from './marketplace_animales.service';
import { CreateMarketplaceAnimaleDto } from './dto/create-marketplace_animale.dto';
import { UpdateMarketplaceAnimaleDto } from './dto/update-marketplace_animale.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { NearbySucursalesDto } from 'src/common/dto/nearby-sucursales.dto';
import { FilterMarketplaceAnimalesDto } from './dto/filter-market-place.dto';
import { SearchMarketplaceDto } from './dto/searc-market.dto';

@Controller('marketplace-animales')
export class MarketplaceAnimalesController {
  constructor(
    private readonly marketplaceAnimalesService: MarketplaceAnimalesService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  @AuthCliente()
  create(
    @Body() createMarketplaceAnimaleDto: CreateMarketplaceAnimaleDto,

    @UploadedFiles()
    files: Express.Multer.File[],
    @GetCliente() cliente: Cliente,
  ) {
    return this.marketplaceAnimalesService.create(
      createMarketplaceAnimaleDto,
      files,
      cliente,
    );
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() nearbyDto: NearbySucursalesDto,
  ) {
    return this.marketplaceAnimalesService.findAll(cliente, nearbyDto);
  }

  @Get('sugerencias')
  @AuthCliente()
  findAllFilters(
    @GetCliente() cliente: Cliente,
    @Query() filters: FilterMarketplaceAnimalesDto,
  ) {
    return this.marketplaceAnimalesService.findAllFilters(cliente, filters);
  }

  @Get('search')
  @AuthCliente()
  searchProducts(
    @GetCliente() cliente: Cliente,
    @Query() searchDto: SearchMarketplaceDto,
  ) {
    return this.marketplaceAnimalesService.searchProducts(cliente, searchDto);
  }

  @Get('/mis-publicaciones')
  @AuthCliente()
  findMyPublicaciones(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.marketplaceAnimalesService.findMyPublicaciones(
      cliente,
      paginationDto,
    );
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string, @GetCliente() cliente: Cliente) {
    return this.marketplaceAnimalesService.findOne(id, cliente);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  @AuthCliente()
  update(
    @Param('id') id: string,

    @Body()
    updateMarketplaceAnimaleDto: UpdateMarketplaceAnimaleDto,

    @UploadedFiles()
    files: Express.Multer.File[],

    @GetCliente()
    cliente: Cliente,
  ) {
    return this.marketplaceAnimalesService.update(
      id,
      updateMarketplaceAnimaleDto,
      files,
      cliente,
    );
  }

  @Patch(':id/vendido')
  @AuthCliente()
  markAsSold(@Param('id') id: string) {
    return this.marketplaceAnimalesService.markAsSold(id);
  }

  @Delete(':id')
  @AuthCliente()
  remove(
    @Param('id') id: string,
    @GetCliente()
    cliente: Cliente,
  ) {
    return this.marketplaceAnimalesService.remove(id, cliente);
  }
}
