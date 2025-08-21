import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProfileImage } from './entities/profile_image.entity';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class ProfileImagesService {
  constructor(
    @InjectRepository(ProfileImage)
    private readonly profileImageRepo: Repository<ProfileImage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async uploadProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ProfileImage> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer as Uint8Array);

    const baseUrl = process.env.APP_URL;
    const fileUrl = `${baseUrl}/uploads/profile/${fileName}`;

    const profileImage = this.profileImageRepo.create({
      url: fileUrl,
      key: fileName,
      mimeType: file.mimetype,
      user,
    });

    return this.profileImageRepo.save(profileImage);
  }

  async getCurrentProfileImage(userId: string): Promise<ProfileImage | null> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profileImages'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.currentProfileImage;
  }

  async getImagesByUser(userId: string): Promise<ProfileImage[]> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profileImages', 'profileImages')
      .where('user.id = :userId', { userId })
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
      'profile',
      image.key,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.profileImageRepo.delete(imageId);
  }
}
