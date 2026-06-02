import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMarketplaceAnimalesImageDto } from './dto/create-marketplace_animales_image.dto';
import { UpdateMarketplaceAnimalesImageDto } from './dto/update-marketplace_animales_image.dto';
import { MarketplaceAnimalesImage } from './entities/marketplace_animales_image.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
@Injectable()
export class MarketplaceAnimalesImagesService {
  constructor(
    @InjectRepository(MarketplaceAnimalesImage)
    private readonly fotosRepo: Repository<MarketplaceAnimalesImage>,
    @InjectRepository(AnimalFinca)
    private readonly marketAnimalRepo: Repository<AnimalFinca>,
  ) {}
  async uploadFotos(
    createMarketplaceAnimalesImageDto: CreateMarketplaceAnimalesImageDto,
    files: Express.Multer.File[],
  ): Promise<MarketplaceAnimalesImage[]> {
    const market_animal_exist = await this.marketAnimalRepo.findOne({
      where: { id: createMarketplaceAnimalesImageDto.animalId },
    });

    if (!market_animal_exist) {
      throw new NotFoundException('Producto no encontrada');
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'fotos_animales_market',
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseUrl = process.env.APP_URL;

    const fotosGuardadas: MarketplaceAnimalesImage[] = [];

    for (const file of files) {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, file.buffer);

      const fileUrl = `${baseUrl}/uploads/fotos_animales_market/${fileName}`;

      const foto = this.fotosRepo.create({
        url: fileUrl,
        key: fileName,
        mimeType: file.mimetype,
        animal: market_animal_exist,
      });

      const savedFoto = await this.fotosRepo.save(foto);
      fotosGuardadas.push(savedFoto);
    }

    return fotosGuardadas;
  }

  create(createMarketplaceAnimalesImageDto: CreateMarketplaceAnimalesImageDto) {
    return 'This action adds a new marketplaceAnimalesImage';
  }

  findAll() {
    return `This action returns all marketplaceAnimalesImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marketplaceAnimalesImage`;
  }

  update(
    id: number,
    updateMarketplaceAnimalesImageDto: UpdateMarketplaceAnimalesImageDto,
  ) {
    return `This action updates a #${id} marketplaceAnimalesImage`;
  }

  async remove(id: string) {
    const imagen = await this.fotosRepo.findOne({
      where: {
        id,
      },
    });

    if (!imagen) {
      throw new NotFoundException('Imagen no encontrada');
    }

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'fotos_animales_market',
      imagen.key,
    );

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    await this.fotosRepo.remove(imagen);

    return {
      message: 'Imagen eliminada correctamente',
    };
  }
}
