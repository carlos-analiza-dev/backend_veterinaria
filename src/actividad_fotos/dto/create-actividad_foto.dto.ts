import { IsUUID } from 'class-validator';

export class CreateActividadFotoDto {
  @IsUUID('4', {
    message: 'El ID de la actividad debe ser un UUID válido',
  })
  actividadId: string;
}
