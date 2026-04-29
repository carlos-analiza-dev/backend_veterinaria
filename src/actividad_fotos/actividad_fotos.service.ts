import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActividadFotoDto } from './dto/create-actividad_foto.dto';
import { UpdateActividadFotoDto } from './dto/update-actividad_foto.dto';
import { ActividadFoto } from './entities/actividad_foto.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ActividadFotosService {
  constructor(
    @InjectRepository(ActividadFoto)
    private readonly fotosRepo: Repository<ActividadFoto>,
    @InjectRepository(ActividadesDiaria)
    private readonly actividadRepo: Repository<ActividadesDiaria>,
  ) {}

  async uploadFotos(
    createActividadFotoDto: CreateActividadFotoDto,
    files: Express.Multer.File[],
  ): Promise<ActividadFoto[]> {
    const actividad_exist = await this.actividadRepo.findOne({
      where: { id: createActividadFotoDto.actividadId },
    });

    if (!actividad_exist) {
      throw new NotFoundException('Actividad no encontrada');
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'fotos_actividades',
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseUrl = process.env.APP_URL;

    const fotosGuardadas: ActividadFoto[] = [];

    for (const file of files) {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, file.buffer);

      const fileUrl = `${baseUrl}/uploads/fotos_actividades/${fileName}`;

      const foto = this.fotosRepo.create({
        url: fileUrl,
        key: fileName,
        mimeType: file.mimetype,
        actividad: actividad_exist,
      });

      const savedFoto = await this.fotosRepo.save(foto);
      fotosGuardadas.push(savedFoto);
    }

    return fotosGuardadas;
  }

  findAll() {
    return `This action returns all actividadFotos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} actividadFoto`;
  }

  update(id: number, updateActividadFotoDto: UpdateActividadFotoDto) {
    return `This action updates a #${id} actividadFoto`;
  }

  remove(id: number) {
    return `This action removes a #${id} actividadFoto`;
  }
}
