import { Module } from '@nestjs/common';
import { ProductosImagesService } from './productos_images.service';
import { ProductosImagesController } from './productos_images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosImage } from './entities/productos_image.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [ProductosImagesController],
  imports: [
    TypeOrmModule.forFeature([ProductosImage, SubServicio, User]),
    AuthModule,
  ],
  providers: [ProductosImagesService],
})
export class ProductosImagesModule {}
