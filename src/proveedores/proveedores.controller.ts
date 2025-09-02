import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { SearchProveedorDto } from './dto/search-proveedor.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  create(
    @Body() createProveedorDto: CreateProveedorDto,
    @GetUser() user: User,
  ) {
    return this.proveedoresService.create(createProveedorDto, user.id);
  }

  @Get()
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAll(@Query() searchProveedorDto: SearchProveedorDto) {
    return this.proveedoresService.findAll(searchProveedorDto);
  }

  @Get('activos')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findAllActive(@GetUser() user: User) {
    return this.proveedoresService.findAllActive(user);
  }

  @Get('pais/:paisId')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findByPais(
    @Param('paisId', ParseUUIDPipe) paisId: string,
    @Query() searchProveedorDto: SearchProveedorDto,
  ) {
    return this.proveedoresService.findByPais(paisId, searchProveedorDto);
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Ganadero, ValidRoles.Veterinario)
  update(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateProveedorDto,
    @GetUser() user: User,
  ) {
    return this.proveedoresService.update(id, updateProveedorDto, user.id);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.proveedoresService.remove(id, user.id);
  }

  @Patch('restore/:id')
  @Auth(ValidRoles.Administrador)
  restore(@Param('id') id: string, @GetUser() user: User) {
    return this.proveedoresService.restore(id, user.id);
  }
}
