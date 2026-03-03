import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoriaProducto } from 'src/interfaces/categoria-productos';

export class CreateProductosGanaderiaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEnum(CategoriaProducto, {
    message: 'Categoría inválida',
  })
  categoria: CategoriaProducto;
}
