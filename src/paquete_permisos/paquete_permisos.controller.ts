import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaquetePermisosService } from './paquete_permisos.service';
import { CreatePaquetePermisoDto } from './dto/create-paquete_permiso.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { UpdatePaquetePermisoDto } from './dto/update-permisos.dto';

@Controller('paquete-permisos')
export class PaquetePermisosController {
  constructor(
    private readonly paquetePermisosService: PaquetePermisosService,
  ) {}

  @Post()
  create(@Body() createPaquetePermisoDto: CreatePaquetePermisoDto) {
    return this.paquetePermisosService.create(createPaquetePermisoDto);
  }

  @Get()
  findAll() {
    return this.paquetePermisosService.findAll();
  }

  @Get('paquete/:id')
  @Auth()
  findByPaquete(@Param('id') id: string, @GetUser() user: User) {
    return this.paquetePermisosService.findByPaquete(id, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paquetePermisosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaquetePermisoDto: UpdatePaquetePermisoDto,
  ) {
    return this.paquetePermisosService.update(id, updatePaquetePermisoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paquetePermisosService.remove(id);
  }
}
