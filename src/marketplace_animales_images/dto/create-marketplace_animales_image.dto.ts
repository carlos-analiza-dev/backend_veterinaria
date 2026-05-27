import { IsUUID } from 'class-validator';

export class CreateMarketplaceAnimalesImageDto {
  @IsUUID('4', {
    message: 'El ID de la actividad debe ser un UUID válido',
  })
  animalId: string;
}
