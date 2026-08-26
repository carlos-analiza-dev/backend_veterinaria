import { IsNotEmpty, IsString } from 'class-validator';

export class AsignarPaqueteCodigoDto {
  @IsString({
    message: 'El código del paquete debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    message: 'El código del paquete es obligatorio.',
  })
  codigo: string;
}
