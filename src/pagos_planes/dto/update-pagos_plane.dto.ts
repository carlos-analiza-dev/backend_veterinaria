import { PartialType } from '@nestjs/mapped-types';
import { CreatePagosPlaneDto } from './create-pagos_plane.dto';

export class UpdatePagosPlaneDto extends PartialType(CreatePagosPlaneDto) {}
