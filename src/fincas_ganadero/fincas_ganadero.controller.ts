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
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('fincas-ganadero')
export class FincasGanaderoController {
  constructor(private readonly fincasGanaderoService: FincasGanaderoService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createFincasGanaderoDto: CreateFincasGanaderoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.fincasGanaderoService.create(createFincasGanaderoDto, cliente);
  }

  @Get('/pais')
  @Auth()
  findAllPais(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.fincasGanaderoService.findAllPais(user, paginationDto);
  }

  @Get('/fincas/:propietadrioId')
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Param('propietadrioId') propietadrioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.fincasGanaderoService.findAll(
      cliente,
      propietadrioId,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fincasGanaderoService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateFincasGanaderoDto: UpdateFincasGanaderoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.fincasGanaderoService.update(
      id,
      updateFincasGanaderoDto,
      cliente,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fincasGanaderoService.remove(+id);
  }
}
