import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { AnimalFincaService } from './animal_finca.service';
import { CreateAnimalFincaDto } from './dto/create-animal_finca.dto';
import {
  UpdateAnimalFincaDto,
  UpdateAvicolaFincaDto,
  UpdateCaprinoFincaDto,
  UpdateOvinoFincaDto,
  UpdatePecesFincaDto,
  UpdatePorcinoFincaDto,
} from './dto/update-animal_finca.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { UpdateDeathStatusDto } from './dto/update-death-status.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateAvicolaDto } from './dto/create-avicola.dto';
import { CreatePecesDto } from './dto/create-peces.dto';
import { CreateCaprinoDto } from './dto/crear-caprino.dto';
import { CreateOvinoDto } from './dto/create-ovino.dto';
import { CreatePorcinoDto } from './dto/crear-porcino.dto';
import { CreateAnimalFromCriaDto } from './dto/create-animal-from-cria.dto';
import { DescarteAnimalDto } from './dto/descarte-animal.dto';
import { CreateMortalidadAnimalDto } from './dto/mortalidad-animal';

@Controller('animal-finca')
export class AnimalFincaController {
  constructor(private readonly animalFincaService: AnimalFincaService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  @AuthCliente()
  create(
    @Body() createAnimalFincaDto: CreateAnimalFincaDto,
    @GetCliente() cliente: Cliente,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.animalFincaService.create(
      createAnimalFincaDto,
      cliente,
      images,
    );
  }

  @Post('avicola')
  @UseInterceptors(FilesInterceptor('images', 5))
  @AuthCliente()
  createAvicola(
    @Body() createAnimalFincaDto: CreateAvicolaDto,
    @GetCliente() cliente: Cliente,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.animalFincaService.createAvicola(
      createAnimalFincaDto,
      cliente,
      images,
    );
  }

  @Post('peces')
  @UseInterceptors(FilesInterceptor('images', 5))
  @AuthCliente()
  createPeces(
    @Body() createAnimalFincaDto: CreatePecesDto,
    @GetCliente() cliente: Cliente,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.animalFincaService.createPeces(
      createAnimalFincaDto,
      cliente,
      images,
    );
  }

  @Post('caprino')
  @UseInterceptors(FilesInterceptor('images', 5))
  @AuthCliente()
  createCaprino(
    @Body() createAnimalFincaDto: CreateCaprinoDto,
    @GetCliente() cliente: Cliente,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.animalFincaService.createCaprino(
      createAnimalFincaDto,
      cliente,
      images,
    );
  }

  @Post('ovino')
  @UseInterceptors(FilesInterceptor('images', 5))
  @AuthCliente()
  createOvino(
    @Body() createAnimalFincaDto: CreateOvinoDto,
    @GetCliente() cliente: Cliente,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.animalFincaService.createOvino(
      createAnimalFincaDto,
      cliente,
      images,
    );
  }

  @Post('porcino')
  @UseInterceptors(FilesInterceptor('images', 5))
  @AuthCliente()
  createPorcino(
    @Body() createAnimalFincaDto: CreatePorcinoDto,
    @GetCliente() cliente: Cliente,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.animalFincaService.createPorcino(
      createAnimalFincaDto,
      cliente,
      images,
    );
  }

  @Post('crear-desde-cria')
  @AuthCliente()
  async createAnimalFromCria(
    @Body() createDto: CreateAnimalFromCriaDto,
    @GetCliente() cliente: Cliente,
  ) {
    const animal = await this.animalFincaService.createAnimalFromCria(
      createDto,
      cliente,
    );
    return {
      success: true,
      data: animal,
      message: 'Animal creado exitosamente desde la cría',
    };
  }

  @Post('descartar/:id')
  @AuthCliente()
  descartarAnimal(
    @Param('id') id: string,
    @Body() descarteDto: DescarteAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.descartarAnimal(id, descarteDto, cliente);
  }

  @Post('descartar-aves/:id')
  @AuthCliente()
  descartarAves(
    @Param('id') id: string,
    @Body() descarteDto: DescarteAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.descartarAves(id, descarteDto, cliente);
  }

  @Post('descartar-peces/:id')
  @AuthCliente()
  descartarPeces(
    @Param('id') id: string,
    @Body() descarteDto: DescarteAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.descartarPeces(id, descarteDto, cliente);
  }

  @Post('carga-masiva/:fincaId/:especieId/:razaId')
  @UseInterceptors(FileInterceptor('file'))
  @AuthCliente()
  async cargaMasiva(
    @GetCliente() cliente: Cliente,
    @UploadedFile() file: Express.Multer.File,
    @Param('fincaId') fincaId: string,
    @Param('especieId') especieId: string,
    @Param('razaId') razaId: string,
  ) {
    return this.animalFincaService.cargaMasiva(
      cliente,
      file,
      fincaId,
      especieId,
      razaId,
    );
  }

  @Get('propietario')
  @AuthCliente()
  findAllAnimales(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.animalFincaService.findAllAnimales(cliente, paginationDto);
  }

  @Get('/propietario-animales/:propietarioId')
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Param('propietarioId') propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.animalFincaService.findAll(
      cliente,
      propietarioId,
      paginationDto,
    );
  }

  @Get('/animales/:fincaId/:especieId/:razaId')
  findAllAnimalesByFincaRaza(
    @Param('fincaId') fincaId: string,
    @Param('especieId') especieId: string,
    @Param('razaId') razaId: string,
  ) {
    return this.animalFincaService.findAllAnimalesByFincaRaza(
      fincaId,
      especieId,
      razaId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.animalFincaService.findOne(id);
  }

  @Patch(':id/death-status')
  @AuthCliente()
  async updateDeathStatus(
    @Param('id') id: string,
    @Body() mortalidadAnimal: CreateMortalidadAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    const updatedAnimal = await this.animalFincaService.updateDeathStatus(
      id,
      mortalidadAnimal,
      cliente,
    );
    return {
      message: 'Estado de muerte actualizado correctamente',
      data: updatedAnimal,
    };
  }

  @Patch(':id/death-status-aves')
  @AuthCliente()
  async updateDeathStatusAves(
    @Param('id') id: string,
    @Body() mortalidadAnimal: CreateMortalidadAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    const updatedAnimal = await this.animalFincaService.updateDeathStatusAves(
      id,
      mortalidadAnimal,
      cliente,
    );
    return {
      message: 'Estado de muerte actualizado correctamente',
      data: updatedAnimal,
    };
  }

  @Patch(':id/death-status-peces')
  @AuthCliente()
  async updateDeathStatusPeces(
    @Param('id') id: string,
    @Body() mortalidadAnimal: CreateMortalidadAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    const updatedAnimal = await this.animalFincaService.updateDeathStatusPeces(
      id,
      mortalidadAnimal,
      cliente,
    );
    return {
      message: 'Estado de muerte actualizado correctamente',
      data: updatedAnimal,
    };
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdateAnimalFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.update(id, updateAnimalFincaDto, cliente);
  }

  @Patch('avicola/:id')
  @AuthCliente()
  updateAvicola(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdateAvicolaFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.updateAvicola(
      id,
      updateAnimalFincaDto,
      cliente,
    );
  }

  @Patch('peces/:id')
  @AuthCliente()
  updatePeces(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdatePecesFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.updatePeces(
      id,
      updateAnimalFincaDto,
      cliente,
    );
  }

  @Patch('caprino/:id')
  @AuthCliente()
  updateCaprino(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdateCaprinoFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.updateCaprino(
      id,
      updateAnimalFincaDto,
      cliente,
    );
  }

  @Patch('ovino/:id')
  @AuthCliente()
  updateOvino(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdateOvinoFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.updateOvino(
      id,
      updateAnimalFincaDto,
      cliente,
    );
  }

  @Patch('porcino/:id')
  @AuthCliente()
  updatePorcino(
    @Param('id') id: string,
    @Body() updateAnimalFincaDto: UpdatePorcinoFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.animalFincaService.updatePorcino(
      id,
      updateAnimalFincaDto,
      cliente,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.animalFincaService.remove(+id);
  }
}
