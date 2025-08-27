import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaxesPaisService } from './taxes_pais.service';
import { CreateTaxesPaiDto } from './dto/create-taxes_pai.dto';
import { UpdateTaxesPaiDto } from './dto/update-taxes_pai.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Controller('taxes-pais')
export class TaxesPaisController {
  constructor(private readonly taxesPaisService: TaxesPaisService) {}

  @Post()
  create(@Body() createTaxesPaiDto: CreateTaxesPaiDto) {
    return this.taxesPaisService.create(createTaxesPaiDto);
  }

  @Get()
  @Auth(ValidRoles.Administrador)
  findAll(@GetUser() user: User) {
    return this.taxesPaisService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxesPaisService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaxesPaiDto: UpdateTaxesPaiDto,
  ) {
    return this.taxesPaisService.update(id, updateTaxesPaiDto);
  }
}
