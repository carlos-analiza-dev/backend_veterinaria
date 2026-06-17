import { PartialType } from '@nestjs/mapped-types';
import { CreateAnunciosPrincipaleDto } from './create-anuncios_principale.dto';

export class UpdateAnunciosPrincipaleDto extends PartialType(CreateAnunciosPrincipaleDto) {}
