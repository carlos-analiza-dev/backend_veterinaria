import {
  IsArray,
  IsDateString,
  IsNumber,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsUUID('4', { message: 'Debe enviar un ID válido de la producción' })
  produccionFincaId: string;

  @IsArray()
  @IsEnum(TipoProduccionGanadera, { each: true })
  @IsOptional()
  tiposProduccion: TipoProduccionGanadera[];

  // Producción de leche
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  produccionLecheCantidad?: number;

  @IsEnum(UnidadProduccionLeche)
  @IsOptional()
  produccionLecheUnidad?: UnidadProduccionLeche;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  vacasOrdeño?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  vacasSecas?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  terneros?: number;

  @IsDateString()
  @IsOptional()
  fechaPromedioSecado?: Date;

  // Carne bovina
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  cabezasEngordeBovino?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  kilosSacrificioBovino?: number;

  // Carne porcina
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  cerdosEngorde?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pesoPromedioCerdo?: number;

  @IsString()
  @IsOptional()
  edadSacrificioPorcino?: string;

  // Carne de ave
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  mortalidadLoteAves?: number;

  // Huevos
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  huevosPorDia?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  gallinasPonedoras?: number;

  @IsEnum(CalidadHuevo)
  @IsOptional()
  calidadHuevo?: CalidadHuevo;

  // Carne caprina
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  animalesEngordeCaprino?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pesoPromedioCaprino?: number;

  @IsString()
  @IsOptional()
  edadSacrificioCaprino?: string;

  // Ganado en pie
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  animalesDisponibles?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pesoPromedioCabeza?: number;

  // Otro
  @IsString()
  @IsOptional()
  otroProductoNombre?: string;

  @IsString()
  @IsOptional()
  otroProductoUnidadMedida?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  otroProductoProduccionMensual?: number;
}
