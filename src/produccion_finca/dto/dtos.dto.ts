import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  Min,
  IsIn,
} from 'class-validator';
import { InsumoTipo } from 'src/produccion_forrajes_insumos/dto/create-produccion_forrajes_insumo.dto';

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

  @IsString()
  @IsOptional()
  edadSacrificioPorcino?: string;

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
  otroProductoProduccionMensual?: number;
}

export type CultivoTipo =
  | 'Maíz'
  | 'Frijol'
  | 'Arroz'
  | 'Sorgo'
  | 'Café'
  | 'Papa'
  | 'Tomate'
  | 'Cebolla'
  | 'Ajo'
  | 'Yuca'
  | 'Hortalizas'
  | 'Frutas'
  | 'Otros';

export type MetodoCultivo = 'Tradicional' | 'Orgánico' | 'Invernadero';

export class CultivoDto {
  @IsEnum([
    'Maíz',
    'Frijol',
    'Arroz',
    'Sorgo',
    'Café',
    'Papa',
    'Tomate',
    'Cebolla',
    'Ajo',
    'Yuca',
    'Hortalizas',
    'Frutas',
    'Otros',
  ])
  @IsOptional()
  tipo: CultivoTipo;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  estacionalidad: string;

  @IsString()
  tiempo_estimado_cultivo: string;

  @IsArray()
  @IsString({ each: true })
  meses_produccion: string[];

  @IsString()
  cantidad_producida_hectareas: string;
}

export class CreateProduccionAgricolaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CultivoDto)
  cultivos: CultivoDto[];
}

export class CreateProduccionApiculturaDto {
  @IsInt({ message: 'El número de colmenas debe ser un entero' })
  @Min(1, { message: 'Debe haber al menos una colmena' })
  @IsOptional()
  numero_colmenas?: number;

  @IsString({ message: 'La frecuencia de cosecha debe ser un texto' })
  @IsOptional()
  frecuencia_cosecha?: string;

  @IsNumber({}, { message: 'La cantidad por cosecha debe ser numérica' })
  @Min(0.1, { message: 'Debe especificar una cantidad válida' })
  @IsOptional()
  cantidad_por_cosecha?: number;

  @IsString({ message: 'La calidad de miel debe ser texto' })
  @IsIn(['Oscura', 'Clara', 'Multifloral'], {
    message: 'La calidad debe ser Oscura, Clara o Multifloral',
  })
  @IsOptional()
  calidad_miel?: 'Oscura' | 'Clara' | 'Multifloral';
}

export class InsumoForrajeDto {
  @IsEnum([
    'Heno',
    'Silo',
    'Pasto',
    'Harina',
    'Alimentos Concentrados elaborados',
    'Otros',
  ])
  tipo: InsumoTipo;

  @IsOptional()
  @IsString()
  tipo_heno?: string;

  @IsOptional()
  @IsString()
  estacionalidad_heno?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  meses_produccion_heno?: string[];

  @IsOptional()
  @IsString()
  tiempo_estimado_cultivo?: string;

  @IsOptional()
  @IsString()
  produccion_manzana?: string;

  @IsOptional()
  @IsString()
  descripcion_otro?: string;
}

export class CreateProduccionForrajesInsumoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsumoForrajeDto)
  insumos: InsumoForrajeDto[];
}

export class ActividadAlternativaDto {
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  cantidad_producida?: string;

  @IsOptional()
  @IsString()
  unidad_medida?: string;

  @IsOptional()
  @IsNumber()
  ingresos_anuales?: number;
}

export class CreateProduccionAlternativaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActividadAlternativaDto)
  actividades: ActividadAlternativaDto[];
}
