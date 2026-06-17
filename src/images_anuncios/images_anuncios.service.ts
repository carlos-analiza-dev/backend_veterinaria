import { Injectable, NotFoundException } from '@nestjs/common';
import { ImagesAnuncio } from './entities/images_anuncio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AnunciosPrincipale } from 'src/anuncios_principales/entities/anuncios_principale.entity';

@Injectable()
export class ImagesAnunciosService {
  constructor(
    @InjectRepository(ImagesAnuncio)
    private readonly anucioImageRepo: Repository<ImagesAnuncio>,
    @InjectRepository(AnunciosPrincipale)
    private readonly anuncioRepo: Repository<AnunciosPrincipale>,
  ) {}

  async uploadAnuncioImage(
    anuncioId: string,
    file: Express.Multer.File,
  ): Promise<ImagesAnuncio> {
    const anuncio_existe = await this.anuncioRepo.findOne({
      where: { id: anuncioId },
    });
    if (!anuncio_existe) {
      throw new NotFoundException('Anuncio no encontrado');
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'images_anuncios',
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer as Uint8Array);

    const baseUrl = process.env.APP_URL;
    const fileUrl = `${baseUrl}/uploads/images_anuncios/${fileName}`;

    const profileImage = this.anucioImageRepo.create({
      url: fileUrl,
      key: fileName,
      mimeType: file.mimetype,
      anuncios: anuncio_existe,
    });

    return this.anucioImageRepo.save(profileImage);
  }

  async deleteImagesByUrls(urls: string[]): Promise<void> {
    if (!urls || urls.length === 0) {
      return;
    }
    console.log('URLs recibidas:', urls);
    const images = await this.anucioImageRepo
      .createQueryBuilder('image')
      .where('image.url IN (:...urls)', { urls })
      .getMany();

    if (images.length === 0) {
      return;
    }

    for (const image of images) {
      try {
        const fileName = image.key || image.url.split('/').pop();
        if (fileName) {
          const uploadDir = path.join(
            __dirname,
            '..',
            '..',
            'uploads',
            'images_anuncios',
          );
          const filePath = path.join(uploadDir, fileName);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.warn(`Error al eliminar archivo`);
      }
    }

    await this.anucioImageRepo.remove(images);
  }

  async deleteImageById(id: string): Promise<void> {
    const image = await this.anucioImageRepo.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    try {
      const fileName = image.key || image.url.split('/').pop();
      if (fileName) {
        const uploadDir = path.join(
          __dirname,
          '..',
          '..',
          'uploads',
          'images_anuncios',
        );
        const filePath = path.join(uploadDir, fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.warn(`Error al eliminar archivo`);
    }

    await this.anucioImageRepo.remove(image);
  }
}
