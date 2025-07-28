import {
  IsArray,
  IsDateString,
  IsNumber,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TipoProduccionGanadera {
  LECHE = 'Leche',
  CARNE_BOVINA = 'Carne Bovina',
  CARNE_PORCINA = 'Carne Porcina',
  CARNE_AVE = 'Carne de Ave',
  HUEVO = 'Huevo',
  CARNE_CAPRINO = 'Carne Caprino',
  GANADO_PIE = 'Ganado en pie',
  OTRO = 'Otro',
}

export enum UnidadProduccionLeche {
  LITROS = 'Litros',
  LIBRAS = 'Libras',
  BOTELLAS = 'Botellas',
}

export enum CalidadHuevo {
  A = 'A',
  AA = 'AA',
  SUCIO = 'Sucio',
}

export class ProduccionGanaderaDto {
  @IsArray()
  @IsEnum(TipoProduccionGanadera, { each: true })
  @IsOptional()
  tiposProduccion: TipoProduccionGanadera[];

  // Campos para producción de leche
  @IsNumber()
  @IsOptional()
  produccionLecheCantidad?: number;

  @IsEnum(UnidadProduccionLeche)
  @IsOptional()
  produccionLecheUnidad?: UnidadProduccionLeche;

  @IsInt()
  @IsOptional()
  vacasOrdeño?: number;

  @IsInt()
  @IsOptional()
  vacasSecas?: number;

  @IsInt()
  @IsOptional()
  terneros?: number;

  @IsDateString()
  @IsOptional()
  fechaPromedioSecado?: Date;

  // Campos para carne bovina
  @IsInt()
  @IsOptional()
  cabezasEngordeBovino?: number;

  @IsNumber()
  @IsOptional()
  kilosSacrificioBovino?: number;

  // Campos para carne porcina
  @IsInt()
  @IsOptional()
  cerdosEngorde?: number;

  @IsNumber()
  @IsOptional()
  pesoPromedioCerdo?: number;

  // Campos para carne de ave
  @IsInt()
  @IsOptional()
  mortalidadLoteAves?: number;

  // Campos para huevos
  @IsInt()
  @IsOptional()
  huevosPorDia?: number;

  @IsInt()
  @IsOptional()
  gallinasPonedoras?: number;

  @IsEnum(CalidadHuevo)
  @IsOptional()
  calidadHuevo?: CalidadHuevo;

  // Campos para carne caprina
  @IsInt()
  @IsOptional()
  animalesEngordeCaprino?: number;

  @IsNumber()
  @IsOptional()
  pesoPromedioCaprino?: number;

  @IsString()
  @IsOptional()
  edadSacrificioCaprino?: string;

  // Campos para ganado en pie
  @IsInt()
  @IsOptional()
  animalesDisponibles?: number;

  @IsNumber()
  @IsOptional()
  pesoPromedioCabeza?: number;

  //Otro
  @IsString()
  @IsOptional()
  otroProductoNombre?: string;

  @IsString()
  @IsOptional()
  otroProductoUnidadMedida?: string;

  @IsNumber()
  @IsOptional()
  otroProductoProduccionMensual: number;
}
