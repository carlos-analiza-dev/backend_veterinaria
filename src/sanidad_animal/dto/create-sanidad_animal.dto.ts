import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateSanidadAnimalDto {
  // Relación con Animal
  @IsUUID('4', { message: 'El ID del animal debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del animal es obligatorio' })
  animalId: string;

  // CAMPOS GLOBALES
  @IsString({ message: 'El tipo de servicio debe ser un texto' })
  @Length(1, 100, {
    message: 'El tipo de servicio debe tener entre 1 y 100 caracteres',
  })
  @IsNotEmpty({ message: 'El tipo de servicio es obligatorio' })
  tipo_servicio: string;

  @IsString({ message: 'El responsable debe ser un texto' })
  @Length(1, 100, {
    message: 'El responsable debe tener entre 1 y 100 caracteres',
  })
  @IsNotEmpty({ message: 'El responsable es obligatorio' })
  responsable: string;

  @Type(() => Date)
  @IsDate({ message: 'La fecha del evento debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha del evento es obligatoria' })
  fecha_evento: Date;

  @Type(() => Date)
  @IsDate({ message: 'La próxima fecha del evento debe ser una fecha válida' })
  @IsOptional()
  proxima_fecha_evento?: Date;

  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  @Length(0, 500, {
    message: 'Las observaciones no pueden exceder los 500 caracteres',
  })
  observaciones?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo base debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El costo base no puede ser negativo' })
  @IsOptional()
  costo_base?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El precio de referencia debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'El precio de referencia no puede ser negativo' })
  @IsOptional()
  precio_referencia?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El margen de referencia debe ser un número con máximo 2 decimales',
    },
  )
  @IsOptional()
  margen_referencia?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo real debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El costo real no puede ser negativo' })
  @IsOptional()
  costo_real?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El valor estimado debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El valor estimado no puede ser negativo' })
  @IsOptional()
  valor_estimado?: number;

  @IsString({ message: 'El tratamiento aplicado debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El tratamiento aplicado no puede exceder los 100 caracteres',
  })
  tratamiento_aplicado?: string;

  @IsString({ message: 'El motivo debe ser un texto' })
  @IsOptional()
  @Length(0, 100, { message: 'El motivo no puede exceder los 100 caracteres' })
  motivo?: string;

  // VACUNAS
  @IsString({ message: 'La vacuna aplicada debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La vacuna aplicada no puede exceder los 100 caracteres',
  })
  vacuna_aplicada?: string;

  @IsString({ message: 'La vía de aplicación de la vacuna debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La vía de aplicación no puede exceder los 100 caracteres',
  })
  via_aplicacion_vacuna?: string;

  @IsString({ message: 'La dosis/tratamiento debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La dosis/tratamiento no puede exceder los 100 caracteres',
  })
  dosis_tratamiento?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La dosis debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'La dosis no puede ser negativa' })
  @IsOptional()
  dosis?: number;

  // DESPARACITACION
  @IsString({ message: 'El tipo de desparasitación debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El tipo de desparasitación no puede exceder los 100 caracteres',
  })
  tipo_desparasitacion?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El peso usado debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El peso usado no puede ser negativo' })
  @IsOptional()
  peso_usado?: number;

  // UBRE
  @IsString({ message: 'La prueba/evento debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La prueba/evento no puede exceder los 100 caracteres',
  })
  prueba_evento?: string;

  @IsString({ message: 'El cuarto afectado debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El cuarto afectado no puede exceder los 100 caracteres',
  })
  cuarto_afectado?: string;

  @IsInt({ message: 'Los días de retiro de leche deben ser un número entero' })
  @Min(0, { message: 'Los días de retiro de leche no pueden ser negativos' })
  @IsOptional()
  dias_retiro_leche?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Los litros diarios actuales deben ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'Los litros diarios actuales no pueden ser negativos' })
  @IsOptional()
  litros_diarios_actuales?: number;

  // PEZUÑAS
  @IsString({ message: 'El tipo de atención debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El tipo de atención no puede exceder los 100 caracteres',
  })
  tipo_atencion?: string;

  @IsString({ message: 'El grado de cojera debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El grado de cojera no puede exceder los 100 caracteres',
  })
  grado_cojera?: string;

  @IsString({ message: 'El miembro afectado debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El miembro afectado no puede exceder los 100 caracteres',
  })
  miembro_afectado?: string;

  // LIMPIEZA GENERAL
  @IsString({ message: 'El potrero/corral/área debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El potrero/corral/área no puede exceder los 100 caracteres',
  })
  potrero_corral_area?: string;

  @IsString({ message: 'La actividad debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La actividad no puede exceder los 100 caracteres',
  })
  actividad?: string;

  @IsString({ message: 'Los dias de descansi deben ser un texto' })
  @IsOptional()
  dias_descanso?: string;

  @IsString({ message: 'La maquinaria o producto utilizado debe ser un texto' })
  @IsOptional()
  producto_maquinaria_utilizada?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La carga animal debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'La carga animal no puede ser negativa' })
  @IsOptional()
  carga_animal?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El costo de producto/maquinaria debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'El costo de producto/maquinaria no puede ser negativo' })
  @IsOptional()
  costo_producto_maquinaria?: number;

  // ESQUILA OVEJAS
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El peso de lana debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El peso de lana no puede ser negativo' })
  @IsOptional()
  peso_lana?: number;

  @IsString({ message: 'La calidad de lana debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La calidad de lana no puede exceder los 100 caracteres',
  })
  calidad_lana?: string;

  @IsString({ message: 'El color de lana debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El color de lana no puede exceder los 100 caracteres',
  })
  color_lana?: string;

  @IsString({ message: 'El responsable de esquila debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El responsable de esquila no puede exceder los 100 caracteres',
  })
  responsable_esquila?: string;

  // BAÑOS OVEJAS
  @IsString({ message: 'El motivo del baño debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El motivo del baño no puede exceder los 100 caracteres',
  })
  motivo_baño?: string;

  @IsInt({ message: 'El tiempo de baño debe ser un número entero' })
  @Min(0, { message: 'El tiempo de baño no puede ser negativo' })
  @IsOptional()
  tiempo_baño?: number;

  @IsString({ message: 'Los hallazgos en piel deben ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'Los hallazgos en piel no pueden exceder los 100 caracteres',
  })
  hallazgos_piel?: string;

  // ODONTOLOGIA EQUINOS
  @IsString({ message: 'El procedimiento debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El procedimiento no puede exceder los 100 caracteres',
  })
  procedimiento?: string;

  @IsString({ message: 'Los hallazgos deben ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'Los hallazgos no pueden exceder los 100 caracteres',
  })
  hallazgos?: string;

  // CASCOS EQUINOS
  @IsString({ message: 'El tipo debe ser un texto' })
  @IsOptional()
  @Length(0, 100, { message: 'El tipo no puede exceder los 100 caracteres' })
  tipo?: string;

  @IsString({ message: 'El herrador debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El herrador no puede exceder los 100 caracteres',
  })
  herrador?: string;

  // LESIONES EQUINOS
  @IsString({ message: 'El tipo de lesión debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El tipo de lesión no puede exceder los 100 caracteres',
  })
  tipo_lesion?: string;

  @IsString({ message: 'La zona afectada debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La zona afectada no puede exceder los 100 caracteres',
  })
  zona_afectada?: string;

  @IsString({ message: 'La severidad debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La severidad no puede exceder los 100 caracteres',
  })
  severidad?: string;

  // CONDICION CORPORAL EQUINOS
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El peso estimado debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El peso estimado no puede ser negativo' })
  @IsOptional()
  peso_estimado?: number;

  @IsString({ message: 'La condición corporal debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La condición corporal no puede exceder los 100 caracteres',
  })
  condicion_corporal?: string;

  @IsString({ message: 'El cambio de dieta debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El cambio de dieta no puede exceder los 100 caracteres',
  })
  cambio_dieta?: string;

  // BAJA/MORTALIDAD PORCINOS y AVES
  @IsInt({ message: 'La cantidad de bajas debe ser un número entero' })
  @Min(0, { message: 'La cantidad de bajas no puede ser negativa' })
  @IsOptional()
  cantidad_bajas?: number;

  @IsString({ message: 'La causa probable de baja debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La causa probable de baja no puede exceder los 100 caracteres',
  })
  causa_baja_probable?: string;

  @IsString({ message: 'La acción correctiva debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La acción correctiva no puede exceder los 100 caracteres',
  })
  accion_correctiva?: string;

  // CAMA/NIDO AVES
  @IsString({ message: 'El tipo de acción debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El tipo de acción no puede exceder los 100 caracteres',
  })
  tipo_accion?: string;

  @IsString({ message: 'El material utilizado debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El material utilizado no puede exceder los 100 caracteres',
  })
  material_utilizado?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La cantidad usada debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'La cantidad usada no puede ser negativa' })
  @IsOptional()
  cantidad_usada?: number;

  // PRODUCCION SANITARIA AVES
  @IsInt({ message: 'Los huevos diarios deben ser un número entero' })
  @Min(0, { message: 'Los huevos diarios no pueden ser negativos' })
  @IsOptional()
  huevos_diarios?: number;

  @IsInt({ message: 'Los huevos rotos deben ser un número entero' })
  @Min(0, { message: 'Los huevos rotos no pueden ser negativos' })
  @IsOptional()
  huevos_rotos?: number;

  @IsInt({ message: 'El porcentaje de postura debe ser un número entero' })
  @Min(0, { message: 'El porcentaje de postura no puede ser negativo' })
  @Max(100, { message: 'El porcentaje de postura no puede superar el 100%' })
  @IsOptional()
  porcentaje_postura?: number;

  @IsString({ message: 'La calidad del huevo debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La calidad del huevo no puede exceder los 100 caracteres',
  })
  calidad_huevo?: string;

  // CALIDAD AGUA PECES
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La temperatura debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'La temperatura no puede ser negativa' })
  @IsOptional()
  temperatura?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El oxígeno debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El oxígeno no puede ser negativo' })
  @IsOptional()
  oxigeno?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El pH debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El pH no puede ser negativo' })
  @Max(14, { message: 'El pH no puede ser mayor a 14' })
  @IsOptional()
  ph?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El amonio debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El amonio no puede ser negativo' })
  @IsOptional()
  amonio?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Los nitritos deben ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'Los nitritos no pueden ser negativos' })
  @IsOptional()
  nitritos?: number;

  // RECAMBIO AGUA PECES
  @IsInt({ message: 'El porcentaje de recambio debe ser un número entero' })
  @Min(0, { message: 'El porcentaje de recambio no puede ser negativo' })
  @Max(100, { message: 'El porcentaje de recambio no puede superar el 100%' })
  @IsOptional()
  porcentaje_recambio?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'El volumen estimado debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'El volumen estimado no puede ser negativo' })
  @IsOptional()
  volumen_estimado?: number;

  // MUESTREO PECES
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'La cantidad de muestreo debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'La cantidad de muestreo no puede ser negativa' })
  @IsOptional()
  cantidad_muestreo?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El peso promedio debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El peso promedio no puede ser negativo' })
  @IsOptional()
  peso_promedio?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La talla promedio debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'La talla promedio no puede ser negativa' })
  @IsOptional()
  talla_promedio?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'La biomasa estimada debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'La biomasa estimada no puede ser negativa' })
  @IsOptional()
  biomasa_estimada?: number;

  @IsString({ message: 'La etapa de los peces debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'La etapa de los peces no puede exceder los 100 caracteres',
  })
  etapa_peces?: string;

  //SIFONEO PECES
  @IsString({ message: 'El area sifoneo de los peces debe ser un texto' })
  @IsOptional()
  @Length(0, 100, {
    message: 'El area sifoneo de los peces no puede exceder los 100 caracteres',
  })
  area_sifoneo?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Las horas de trabajo sifoneo estimada debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, {
    message: 'Las horas de trabajo sifoneo estimada no puede ser negativa',
  })
  @IsOptional()
  horas_trabajo?: number;

  @IsString({
    message: 'El equipo utilizado sifoneo de los peces debe ser un texto',
  })
  @IsOptional()
  @Length(0, 100, {
    message:
      'El equipo utilizado sifoneo de los peces no puede exceder los 100 caracteres',
  })
  equipo_utilizado?: string;
}
