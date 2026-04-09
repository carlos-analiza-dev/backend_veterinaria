import { IsUUID } from 'class-validator';

export class CreateClienteFincaTrabajadorDto {
  @IsUUID()
  trabajadorId: string;

  @IsUUID()
  fincaId: string;
}
