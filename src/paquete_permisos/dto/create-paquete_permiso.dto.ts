import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaquetePermisoDto {
  @IsUUID('4', {
    message: 'El id del paquete debe ser un UUID válido',
  })
  @IsNotEmpty({
    message: 'El paquete es obligatorio',
  })
  paqueteId: string;

  @IsArray({
    message: 'Los permisos deben enviarse en un arreglo',
  })
  @ArrayMinSize(1, {
    message: 'Debes enviar al menos un permiso',
  })
  @IsUUID('4', {
    each: true,
    message: 'Uno de los permisos no es un UUID válido',
  })
  permisosIds: string[];
}
