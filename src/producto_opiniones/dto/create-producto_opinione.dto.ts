import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateProductoOpinioneDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsUUID()
  productoId: string;
}
