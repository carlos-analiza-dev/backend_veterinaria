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
import { HistorialClinicoService } from './historial_clinico.service';
import { CreateHistorialClinicoDto } from './dto/create-historial_clinico.dto';
import { UpdateHistorialClinicoDto } from './dto/update-historial_clinico.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';

@Controller('historial-clinico')
export class HistorialClinicoController {
  constructor(
    private readonly historialClinicoService: HistorialClinicoService,
  ) {}

  @Post()
  @Auth(ValidRoles.Veterinario)
  create(
    @GetUser() user: User,
    @Body() createHistorialClinicoDto: CreateHistorialClinicoDto,
  ) {
    return this.historialClinicoService.create(user, createHistorialClinicoDto);
  }

  @Get(':veterinarioId')
  @Auth()
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.historialClinicoService.findAll(user, paginationDto);
  }

  @Get('/animales/:animalId')
  @Auth()
  findAnimal(
    @Param('animalId') animalId: string,
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.historialClinicoService.findAnimal(
      animalId,
      user,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialClinicoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHistorialClinicoDto: UpdateHistorialClinicoDto,
  ) {
    return this.historialClinicoService.update(id, updateHistorialClinicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialClinicoService.remove(id);
  }
}
