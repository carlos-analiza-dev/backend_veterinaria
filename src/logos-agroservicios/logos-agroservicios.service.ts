import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogosAgroservicioDto } from './dto/create-logos-agroservicio.dto';
import { UpdateLogosAgroservicioDto } from './dto/update-logos-agroservicio.dto';
import { LogosAgroservicio } from './entities/logos-agroservicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LogosAgroserviciosService {
  constructor(
    @InjectRepository(DatosAgroservicio)
    private readonly agroRepo: Repository<DatosAgroservicio>,
    @InjectRepository(LogosAgroservicio)
    private readonly logoAgroRepo: Repository<LogosAgroservicio>,
  ) {}

  async uploadProfileImage(
    agroId: string,
    file: Express.Multer.File,
  ): Promise<LogosAgroservicio> {
    const agro = await this.agroRepo.findOne({ where: { id: agroId } });
    if (!agro) {
      throw new NotFoundException('Agroservicio no encontrado');
    }

    const logoExistente = await this.logoAgroRepo.findOne({
      where: {
        agroservicio: {
          id: agroId,
        },
      },
    });

    if (logoExistente) {
      const oldPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'logos_agroservicios',
        logoExistente.key,
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      await this.logoAgroRepo.remove(logoExistente);
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'logos_agroservicios',
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer as Uint8Array);

    const baseUrl = process.env.APP_URL;
    const fileUrl = `${baseUrl}/uploads/logos_agroservicios/${fileName}`;

    const profileImage = this.logoAgroRepo.create({
      url: fileUrl,
      key: fileName,
      mimeType: file.mimetype,
      agroservicio: agro,
    });

    return this.logoAgroRepo.save(profileImage);
  }

  async findAll(propietarioId: string) {
    const imagenLogo = await this.logoAgroRepo.findOne({
      where: { agroservicio: { propietarioId } },
    });
    if (!imagenLogo)
      throw new NotFoundException('No se encontro logo para el agroservicio');
    return imagenLogo;
  }

  async remove(id: string): Promise<{ message: string }> {
    const logo = await this.logoAgroRepo.findOne({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundException('Logo no encontrado');
    }

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'logos_agroservicios',
      logo.key,
    );

    if (logo.key && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.logoAgroRepo.remove(logo);

    return {
      message: 'Logo eliminado correctamente',
    };
  }
}
