import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DescuentosClientesService } from './descuentos_clientes.service';
import { CreateDescuentosClienteDto } from './dto/create-descuentos_cliente.dto';
import { UpdateDescuentosClienteDto } from './dto/update-descuentos_cliente.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Controller('descuentos-clientes')
export class DescuentosClientesController {
  constructor(
    private readonly descuentosClientesService: DescuentosClientesService,
  ) {}

  @Post()
  create(@Body() createDescuentosClienteDto: CreateDescuentosClienteDto) {
    return this.descuentosClientesService.create(createDescuentosClienteDto);
  }

  @Get()
  @Auth(ValidRoles.Administrador)
  findAll(@GetUser() user: User) {
    return this.descuentosClientesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.descuentosClientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDescuentosClienteDto: UpdateDescuentosClienteDto,
  ) {
    return this.descuentosClientesService.update(
      id,
      updateDescuentosClienteDto,
    );
  }
}
