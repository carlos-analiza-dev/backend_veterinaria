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
import { TipoProductoService } from './tipo_producto.service';
import { CreateTipoProductoDto } from './dto/create-tipo_producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo_producto.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('tipo-producto')
export class TipoProductoController {
  constructor(private readonly tipoProductoService: TipoProductoService) {}

  @Post()
  @Auth()
  create(
    @Body() createTipoProductoDto: CreateTipoProductoDto,
    @GetUser() user: User,
  ) {
    return this.tipoProductoService.create(createTipoProductoDto, user);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.tipoProductoService.findAll(paginationDto);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.tipoProductoService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateTipoProductoDto: UpdateTipoProductoDto,
    @GetUser() user: User,
  ) {
    return this.tipoProductoService.update(id, updateTipoProductoDto, user);
  }
}
