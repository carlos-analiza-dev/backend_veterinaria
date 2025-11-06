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
import { FincasGanaderoService } from './fincas_ganadero.service';
import { CreateFincasGanaderoDto } from './dto/create-fincas_ganadero.dto';
import { UpdateFincasGanaderoDto } from './dto/update-fincas_ganadero.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Controller('fincas-ganadero')
export class FincasGanaderoController {
  constructor(private readonly fincasGanaderoService: FincasGanaderoService) {}

  @Post()
  create(@Body() createFincasGanaderoDto: CreateFincasGanaderoDto) {
    return this.fincasGanaderoService.create(createFincasGanaderoDto);
  }

  @Get('/pais')
  @Auth()
  findAllPais(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.fincasGanaderoService.findAllPais(user, paginationDto);
  }

  @Get('/fincas/:propietadrioId')
  findAll(
    @Param('propietadrioId') propietadrioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.fincasGanaderoService.findAll(propietadrioId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fincasGanaderoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFincasGanaderoDto: UpdateFincasGanaderoDto,
  ) {
    return this.fincasGanaderoService.update(id, updateFincasGanaderoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fincasGanaderoService.remove(+id);
  }
}
