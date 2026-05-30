import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMarketplaceVisualizacioneDto } from './dto/create-marketplace_visualizacione.dto';
import { UpdateMarketplaceVisualizacioneDto } from './dto/update-marketplace_visualizacione.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketplaceVisualizacione } from './entities/marketplace_visualizacione.entity';
import { Repository } from 'typeorm';
import { MarketplaceAnimale } from 'src/marketplace_animales/entities/marketplace_animale.entity';

@Injectable()
export class MarketplaceVisualizacionesService {
  constructor(
    @InjectRepository(MarketplaceVisualizacione)
    private readonly visualizacionRepo: Repository<MarketplaceVisualizacione>,

    @InjectRepository(MarketplaceAnimale)
    private readonly marketplaceRepo: Repository<MarketplaceAnimale>,
  ) {}
  async create(
    createMarketplaceVisualizacioneDto: CreateMarketplaceVisualizacioneDto,
    cliente: Cliente,
  ) {
    const { publicacionId } = createMarketplaceVisualizacioneDto;

    const publicacion = await this.marketplaceRepo.findOne({
      where: {
        id: publicacionId,
      },
    });

    if (!publicacion) {
      throw new NotFoundException(`Publicación ${publicacionId} no encontrada`);
    }

    if (publicacion.vendedor.id === cliente.id) {
      return {
        ok: true,
        counted: false,
      };
    }

    const fechaHoy = new Date().toISOString().split('T')[0];

    const existingView = await this.visualizacionRepo.findOne({
      where: {
        publicacionId,
        usuarioId: cliente.id,
        fecha_vista: fechaHoy as any,
      },
    });

    if (existingView) {
      return {
        ok: true,
        counted: false,
      };
    }

    await this.visualizacionRepo.save({
      publicacion,
      publicacionId,
      usuario: cliente,
      usuarioId: cliente.id,
      fecha_vista: fechaHoy as any,
    });

    await this.marketplaceRepo.increment({ id: publicacionId }, 'views', 1);

    return {
      ok: true,
      counted: true,
    };
  }

  findAll() {
    return `This action returns all marketplaceVisualizaciones`;
  }

  async findByPublicacion(publicacionId: string) {
    const visualizaciones = await this.visualizacionRepo.find({
      where: {
        publicacionId,
      },
      relations: {
        usuario: true,
      },
      order: {
        created_at: 'DESC',
      },
    });

    return {
      publicacionId,
      totalVisualizaciones: visualizaciones.length,
    };
  }

  update(
    id: number,
    updateMarketplaceVisualizacioneDto: UpdateMarketplaceVisualizacioneDto,
  ) {
    return `This action updates a #${id} marketplaceVisualizacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketplaceVisualizacione`;
  }
}
