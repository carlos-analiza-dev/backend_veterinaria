import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductosImageDto } from './dto/create-productos_image.dto';
import { UpdateProductosImageDto } from './dto/update-productos_image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductosImage } from './entities/productos_image.entity';
import { Repository } from 'typeorm';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductosImagesService {
  constructor(
    @InjectRepository(ProductosImage)
    private readonly productoImageRepo: Repository<ProductosImage>,
    @InjectRepository(SubServicio)
    private readonly servicioRepo: Repository<SubServicio>,
  ) {}

  async uploadProfileImageProducto(
    productoId: string,
    file: Express.Multer.File,
  ): Promise<ProductosImage> {
    const producto = await this.servicioRepo.findOne({
      where: { id: productoId },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'producto_images',
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer as Uint8Array);

    const baseUrl = process.env.APP_URL;
    const fileUrl = `${baseUrl}/uploads/producto_images/${fileName}`;

    const profileImage = this.productoImageRepo.create({
      url: fileUrl,
      key: fileName,
      mimeType: file.mimetype,
      producto,
    });

    return this.productoImageRepo.save(profileImage);
  }

  findAll() {
    return `This action returns all productosImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productosImage`;
  }

  update(id: number, updateProductosImageDto: UpdateProductosImageDto) {
    return `This action updates a #${id} productosImage`;
  }

  async deleteProfileImage(imageId: string): Promise<void> {
    const image = await this.productoImageRepo.findOne({
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
      'producto_images',
      image.key,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.productoImageRepo.delete(imageId);
  }
}
