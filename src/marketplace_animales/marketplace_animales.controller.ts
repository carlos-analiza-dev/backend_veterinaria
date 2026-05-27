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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketplaceAnimalesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMarketplaceAnimaleDto: UpdateMarketplaceAnimaleDto,
  ) {
    return this.marketplaceAnimalesService.update(
      +id,
      updateMarketplaceAnimaleDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketplaceAnimalesService.remove(+id);
  }
}
