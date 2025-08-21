import { Injectable, NotFoundException } from '@nestjs/common';
import { ImagesAminale } from './entities/images_aminale.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';

@Injectable()
export class ImagesAminalesService {
  constructor(
    @InjectRepository(ImagesAminale)
    private readonly profileImageRepo: Repository<ImagesAminale>,
    @InjectRepository(AnimalFinca)
    private readonly animalRepo: Repository<AnimalFinca>,
  ) {}

  async uploadProfileImage(
    animalId: string,
    file: Express.Multer.File,
  ): Promise<ImagesAminale> {
    const animal = await this.animalRepo.findOne({ where: { id: animalId } });
    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'profile_animal',
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer as Uint8Array);

    const baseUrl = process.env.APP_URL;
    const fileUrl = `${baseUrl}/uploads/profile_animal/${fileName}`;

    const profileImage = this.profileImageRepo.create({
      url: fileUrl,
      key: fileName,
      mimeType: file.mimetype,
      animal,
    });

    return this.profileImageRepo.save(profileImage);
  }

  async getCurrentProfileImage(
    animalId: string,
  ): Promise<ImagesAminale | null> {
    const user = await this.animalRepo.findOne({
      where: { id: animalId },
      relations: ['profileImages'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.currentProfileImage;
  }

  async getImagesByUser(animalId: string): Promise<ImagesAminale[]> {
    const user = await this.animalRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profileImages', 'profileImages')
      .where('user.id = :animalId', { animalId })
      .orderBy('profileImages.createdAt', 'DESC')
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.profileImages;
  }

  async deleteProfileImage(imageId: string): Promise<void> {
    const image = await this.profileImageRepo.findOne({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'profile_animal',
      image.key,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.profileImageRepo.delete(imageId);
  }
}
