import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialDocumentoDto } from './create-historial_documento.dto';

export class UpdateHistorialDocumentoDto extends PartialType(CreateHistorialDocumentoDto) {}
