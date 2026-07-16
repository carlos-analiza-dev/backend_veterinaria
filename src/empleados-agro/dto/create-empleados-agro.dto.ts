import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateEmpleadosAgroDto {
  @IsString({
    message: 'El nombre del empleado debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El nombre del empleado es obligatorio.',
  })
  @Length(3, 150, {
    message: 'El nombre del empleado debe tener entre 3 y 150 caracteres.',
  })
  nombre: string;

  @IsString({
    message: 'La identificación debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La identificación es obligatoria.',
  })
  @Length(5, 30, {
    message: 'La identificación debe tener entre 5 y 30 caracteres.',
  })
  identificacion: string;

  @IsString({
    message: 'El teléfono debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El teléfono es obligatorio.',
  })
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'El teléfono contiene caracteres no válidos.',
  })
  @Length(8, 20, {
    message: 'El teléfono debe tener entre 8 y 20 caracteres.',
  })
  telefono: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido.',
    },
  )
  @Length(5, 150, {
    message: 'El correo electrónico debe tener entre 5 y 150 caracteres.',
  })
  email?: string;

  @IsString({
    message: 'La contraseña debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria.',
  })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  })
  password: string;

  @IsOptional()
  @IsString({
    message: 'La dirección debe ser un texto.',
  })
  @Length(5, 255, {
    message: 'La dirección debe tener entre 5 y 255 caracteres.',
  })
  direccion?: string;

  @IsString({
    message: 'El sexo debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar el sexo del empleado.',
  })
  @Length(1, 20, {
    message: 'El sexo seleccionado no es válido.',
  })
  sexo: string;

  @IsUUID('4', {
    message: 'El rol seleccionado no es válido.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar un rol.',
  })
  roleId: string;

  @IsUUID('4', {
    message: 'El país seleccionado no es válido.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar un país.',
  })
  paisId: string;

  @IsUUID('4', {
    message: 'El departamento seleccionado no es válido.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar un departamento.',
  })
  departamentoId: string;

  @IsUUID('4', {
    message: 'El municipio seleccionado no es válido.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar un municipio.',
  })
  municipioId: string;

  @IsUUID('4', {
    message: 'La sucursal seleccionada no es válida.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar una sucursal.',
  })
  sucursalId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
