import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AgroProductosService } from './agro-productos.service';
import { CreateAgroProductoDto } from './dto/create-agro-producto.dto';
import { UpdateAgroProductoDto } from './dto/update-agro-producto.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('agro-productos')
export class AgroProductosController {
  constructor(private readonly agroProductosService: AgroProductosService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createAgroProductoDto: CreateAgroProductoDto,
  ) {
    return this.agroProductosService.create(cliente, createAgroProductoDto);
  }

  @Post('empleado')
  @AuthEmpleado()
  createAgroEmpleado(
    @Body() createAgroProductoDto: CreateAgroProductoDto,
    @GetEmpleado() empleado: EmpleadosAgro,
  ) {
    return this.agroProductosService.createAgroEmpleado(
      createAgroProductoDto,
      empleado,
    );
  }

  @Post('upload/:productoId')
  @UseInterceptors(FilesInterceptor('imagenes', 5))
  uploadImagesProducto(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @UploadedFiles() imagenes: Express.Multer.File[],
  ) {
    return this.agroProductosService.uploadImagesProducto(productoId, imagenes);
  }

  @Get('agroservicio/:propietarioId')
  findAll(
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroProductosService.findAll(propietarioId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroProductosService.findOne(+id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateAgroProductoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.agroProductosService.update(id, updateProductoDto, cliente);
  }

  @Patch('empleado/:id')
  @AuthEmpleado()
  updateEmpleado(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateAgroProductoDto,
    @GetEmpleado() empleado: EmpleadosAgro,
  ) {
    return this.agroProductosService.updateEmpleado(
      id,
      updateProductoDto,
      empleado,
    );
  }

  @Delete('upload/:imageId')
  deleteImageProducto(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.agroProductosService.deleteImageProducto(imageId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroProductosService.remove(+id);
  }
}
