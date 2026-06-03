import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { MessageImage } from './entities/message-image.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatImageService {
  /* constructor(
    @InjectRepository(MessageImage, 'chatConnection')
    private messageImageRepository: Repository<MessageImage>,
  ) {}

  async uploadMessageImages(
    files: Express.Multer.File[],
    message: Message,
  ): Promise<MessageImage[]> {
    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'chat_images',
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedImages: MessageImage[] = [];

    for (const file of files) {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, file.buffer as Uint8Array);

      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      const fileUrl = `${baseUrl}/uploads/chat_images/${fileName}`;

      const messageImage = this.messageImageRepository.create({
        url: fileUrl,
        key: fileName,
        mimeType: file.mimetype,
        message: message,
        messageId: message.id,
      });

      const savedImage = await this.messageImageRepository.save(messageImage);
      savedImages.push(savedImage);
    }

    return savedImages;
  }

  async deleteMessageImage(imageId: string): Promise<void> {
    const image = await this.messageImageRepository.findOne({
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
      'chat_images',
      image.key,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.messageImageRepository.remove(image);
  }

  async getMessageImages(messageId: string): Promise<MessageImage[]> {
    return this.messageImageRepository.find({
      where: { messageId },
      order: { created_at: 'ASC' },
    });
  } */
}
