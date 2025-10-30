import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialDocumento } from './entities/historial_documento.entity';
import { HistorialDetalle } from 'src/historial_detalles/entities/historial_detalle.entity';

@Injectable()
export class HistorialDocumentosService {
  constructor(
    @InjectRepository(HistorialDocumento)
    private readonly documentoRepo: Repository<HistorialDocumento>,
    @InjectRepository(HistorialDetalle)
    private readonly detalleRepo: Repository<HistorialDetalle>,
  ) {}

  async uploadDocumentos(
    detalleId: string,
    files: Express.Multer.File[],
  ): Promise<HistorialDocumento[]> {
    const detalle = await this.detalleRepo.findOne({
      where: { id: detalleId },
      relations: ['documentos'],
    });

    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'historial_docs',
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const documentosGuardados: HistorialDocumento[] = [];

    for (const file of files) {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, file.buffer as Uint8Array);

      const fileUrl = `${baseUrl}/uploads/historial_docs/${fileName}`;

      const documento = this.documentoRepo.create({
        nombre: file.originalname,
        url: fileUrl,
        key: fileName,
        mimeType: file.mimetype,
        detalle,
      });

      const saved = await this.documentoRepo.save(documento);
      documentosGuardados.push(saved);
    }

    return documentosGuardados;
  }

  async getDocumentosByDetalle(
    detalleId: string,
  ): Promise<HistorialDocumento[]> {
    const detalle = await this.detalleRepo.findOne({
      where: { id: detalleId },
      relations: ['documentos'],
    });
    if (!detalle) throw new NotFoundException('Detalle no encontrado');

    return detalle.documentos;
  }

  async deleteDocumento(documentoId: string): Promise<void> {
    const documento = await this.documentoRepo.findOne({
      where: { id: documentoId },
    });
    if (!documento) throw new NotFoundException('Documento no encontrado');

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'historial_docs',
      documento.key,
    );
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await this.documentoRepo.delete(documentoId);
  }

  async downloadDocumento(documentoId: string): Promise<{
    stream: StreamableFile;
    filename: string;
    mimeType: string;
  }> {
    const documento = await this.documentoRepo.findOne({
      where: { id: documentoId },
    });

    if (!documento) throw new NotFoundException('Documento no encontrado');

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'historial_docs',
      documento.key,
    );

    if (!fs.existsSync(filePath))
      throw new NotFoundException('El archivo físico no existe');

    const fileStream = fs.createReadStream(filePath);
    return {
      stream: new StreamableFile(fileStream),
      filename: documento.nombre,
      mimeType: documento.mimeType,
    };
  }
}
