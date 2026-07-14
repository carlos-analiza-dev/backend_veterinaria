import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRolesAgroDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
