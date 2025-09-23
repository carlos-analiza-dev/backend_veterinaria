import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesClient } from './entities/images_client.entity';
import { Repository } from 'typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImagesClientService {
  constructor(
    @InjectRepository(ImagesClient)
    private readonly profileImageRepo: Repository<ImagesClient>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async uploadProfileImage(
    cliente: Cliente,
    file: Express.Multer.File,
  ): Promise<ImagesClient> {
    const clienteId = cliente.id;
    const cliente_existe = await this.clienteRepo.findOne({
      where: { id: clienteId },
    });
    if (!cliente_existe) {
      throw new NotFoundException('cliente no encontrado');
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'profile_cliente',
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer as Uint8Array);

    const baseUrl = process.env.APP_URL;
    const fileUrl = `${baseUrl}/uploads/profile_cliente/${fileName}`;

    const profileImage = this.profileImageRepo.create({
      url: fileUrl,
      key: fileName,
      mimeType: file.mimetype,
      cliente,
    });

    return this.profileImageRepo.save(profileImage);
  }

  async getCurrentProfileImage(cliente: Cliente): Promise<ImagesClient | null> {
    const clienteId = cliente.id;
    const user = await this.clienteRepo.findOne({
      where: { id: clienteId },
      relations: ['profileImages'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.currentProfileImage;
  }

  async getImagesByUser(cliente: Cliente): Promise<ImagesClient[]> {
    const clienteId = cliente.id;
    const user = await this.clienteRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profileImages', 'profileImages')
      .where('user.id = :clienteId', { clienteId })
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
      'profile_cliente',
      image.key,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.profileImageRepo.delete(imageId);
  }
}
