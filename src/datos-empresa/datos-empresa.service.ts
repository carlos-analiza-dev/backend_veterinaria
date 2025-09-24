import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatosEmpresa } from './entities/datos-empresa.entity';
import { CreateDatosEmpresaDto } from './dto/create-datos-empresa.dto';
import { UpdateDatosEmpresaDto } from './dto/update-datos-empresa.dto';

@Injectable()
export class DatosEmpresaService {
  constructor(
    @InjectRepository(DatosEmpresa)
    private readonly datosEmpresaRepository: Repository<DatosEmpresa>,
  ) {}

  async create(createDatosEmpresaDto: CreateDatosEmpresaDto) {
    const existingData = await this.datosEmpresaRepository.findOne({
      where: {},
    });

    if (existingData) {
      throw new BadRequestException(
        'Ya esta registrada la empresa, solo se permite una',
      );
    }

    const rtnFormateado = createDatosEmpresaDto.rtn.replace(/-/g, '');

    const datosEmpresa = this.datosEmpresaRepository.create({
      ...createDatosEmpresaDto,
      rtn: rtnFormateado,
    });

    return await this.datosEmpresaRepository.save(datosEmpresa);
  }

  async findOne() {
    const datosEmpresa = await this.datosEmpresaRepository.findOne({
      where: {},
    });

    if (!datosEmpresa) {
      throw new NotFoundException('No se encontraron datos de la empresa');
    }

    return datosEmpresa;
  }

  async update(id: string, updateDatosEmpresaDto: UpdateDatosEmpresaDto) {
    const datosEmpresa = await this.datosEmpresaRepository.findOne({
      where: { id },
    });

    if (!datosEmpresa) {
      throw new NotFoundException('No se encontraron datos de la empresa');
    }

    if (updateDatosEmpresaDto.rtn) {
      updateDatosEmpresaDto.rtn = updateDatosEmpresaDto.rtn.replace(/-/g, '');
    }

    Object.assign(datosEmpresa, updateDatosEmpresaDto);

    return await this.datosEmpresaRepository.save(datosEmpresa);
  }

  async remove(id: string) {
    const datosEmpresa = await this.datosEmpresaRepository.findOne({
      where: { id },
    });

    if (!datosEmpresa) {
      throw new NotFoundException('No se encontraron datos de la empresa');
    }

    await this.datosEmpresaRepository.remove(datosEmpresa);

    return {
      message: 'Datos de empresa eliminados exitosamente',
    };
  }
}
