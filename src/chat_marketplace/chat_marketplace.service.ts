import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { InjectRepository as InjectRepositoryDefault } from '@nestjs/typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { MarketplaceAnimale } from 'src/marketplace_animales/entities/marketplace_animale.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { ChatMarketplaceGateway } from './chat_marketplace.gateway';
import { ChatImageService } from './chat-image.service';

@Injectable()
export class ChatMarketplaceService {
  constructor(
    @InjectRepository(Conversation, 'chatConnection')
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(Message, 'chatConnection')
    private messageRepository: Repository<Message>,

    @InjectRepositoryDefault(Cliente)
    private clienteRepository: Repository<Cliente>,

    @InjectRepositoryDefault(MarketplaceAnimale)
    private productRepository: Repository<MarketplaceAnimale>,
    private readonly chatMarketplaceGateway: ChatMarketplaceGateway,
    private readonly chatImageService: ChatImageService,
  ) {}

  async saveMessage(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create({
      ...createMessageDto,
      isRead: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.conversationRepository.update(
      { id: createMessageDto.conversationId },
      { lastMessageAt: new Date() },
    );

    const sender = await this.clienteRepository.findOne({
      where: { id: savedMessage.senderId },
      relations: ['profileImages'],
    });

    const receiver = await this.clienteRepository.findOne({
      where: { id: savedMessage.receiverId },
      relations: ['profileImages'],
    });

    return {
      ...savedMessage,
      sender,
      receiver,
    };
  }

  async uploadImagesChat(
    createMessageDto: CreateMessageDto,
    cliente: Cliente,
    images?: Express.Multer.File[],
  ) {
    try {
      const message = this.messageRepository.create({
        ...createMessageDto,
        senderId: cliente.id,
        isRead: false,
        message: createMessageDto.message || '',
      });

      const savedMessage = await this.messageRepository.save(message);

      let uploadedImages = [];

      if (images?.length) {
        uploadedImages = await this.chatImageService.uploadMessageImages(
          images,
          savedMessage,
        );
      }

      await this.conversationRepository.update(
        { id: createMessageDto.conversationId },
        { lastMessageAt: new Date() },
      );

      const sender = await this.clienteRepository.findOne({
        where: { id: savedMessage.senderId },
        relations: ['profileImages'],
      });

      const receiver = await this.clienteRepository.findOne({
        where: { id: savedMessage.receiverId },
        relations: ['profileImages'],
      });

      const response = {
        ...savedMessage,
        sender,
        receiver,
        images: uploadedImages,
      };

      this.chatMarketplaceGateway.server
        .to(`user-${savedMessage.receiverId}`)
        .emit('new-message', response);

      this.chatMarketplaceGateway.server
        .to(`conversation-${savedMessage.conversationId}`)
        .emit('new-message', response);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getOrCreateConversation(
    buyerId: string,
    sellerId: string,
    productId: string,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['vendedor', 'marketAnimalImages'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    let conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.productId = :productId', { productId })
      .andWhere('conversation.isActive = true')
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            'conversation.buyerId = :buyerId AND conversation.sellerId = :sellerId',
            { buyerId, sellerId },
          ).orWhere(
            'conversation.buyerId = :sellerId AND conversation.sellerId = :buyerId',
            { buyerId, sellerId },
          );
        }),
      )
      .getOne();

    if (!conversation) {
      conversation = this.conversationRepository.create({
        buyerId,
        sellerId,
        productId,
        lastMessageAt: new Date(),
      });
      conversation = await this.conversationRepository.save(conversation);
    }

    const buyer = await this.clienteRepository.findOne({
      where: { id: conversation.buyerId },
      relations: ['profileImages'],
    });

    const seller = await this.clienteRepository.findOne({
      where: { id: conversation.sellerId },
      relations: ['profileImages'],
    });

    return {
      ...conversation,
      buyer,
      seller,
      product,
    };
  }

  async getConversationMessages(conversationId: string) {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.images', 'images')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.created_at', 'ASC')
      .getMany();

    if (messages.length === 0) {
      return [];
    }

    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const receiverIds = [...new Set(messages.map((m) => m.receiverId))];
    const allUserIds = [...new Set([...senderIds, ...receiverIds])];

    const users = await this.clienteRepository.find({
      where: { id: In(allUserIds) },
      relations: ['profileImages'],
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return messages.map((message) => ({
      id: message.id,
      message: message.message,
      senderId: message.senderId,
      receiverId: message.receiverId,
      conversationId: message.conversationId,
      isRead: message.isRead,
      hasImages: message.images && message.images.length > 0,
      created_at: message.created_at,
      sender: this.mapToReceiver(userMap.get(message.senderId)),
      receiver: this.mapToReceiver(userMap.get(message.receiverId)),
      images:
        message.images?.map((img) => ({
          id: img.id,
          url: img.url,
          key: img.key,
          messageId: img.messageId,
          mimeType: img.mimeType,
          createdAt: img.created_at,
        })) || [],
    }));
  }

  private mapToReceiver(user: any): {
    id: string;
    nombre: string;
    email: string;
    profileImage: any | null;
  } {
    if (!user) return null;

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      profileImage:
        user.profileImages && user.profileImages.length > 0
          ? {
              id: user.profileImages[0].id,
              url: user.profileImages[0].url,
              key: user.profileImages[0].key,
              mimeType: user.profileImages[0].mimeType,
              createdAt: user.profileImages[0].createdAt,
              updatedAt: user.profileImages[0].updatedAt,
            }
          : null,
    };
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    await this.messageRepository.update(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true },
    );
  }

  async getUserConversations(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(
        '(conversation.buyerId = :userId OR conversation.sellerId = :userId)',
        { userId },
      )
      .andWhere('conversation.isActive = true')
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(Message, 'message')
          .where('message.conversationId = conversation.id')
          .getQuery();

        return `EXISTS ${subQuery}`;
      })
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getMany();

    if (conversations.length === 0) {
      return [];
    }

    const unreadCounts = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.conversationId', 'conversationId')
      .addSelect('COUNT(*)', 'unreadCount')
      .where('message.receiverId = :userId', { userId })
      .andWhere('message.isRead = false')
      .groupBy('message.conversationId')
      .getRawMany();

    const unreadMap = new Map();
    unreadCounts.forEach((item) => {
      unreadMap.set(item.conversationId, parseInt(item.unreadCount));
    });

    const buyerIds = [...new Set(conversations.map((c) => c.buyerId))];
    const sellerIds = [...new Set(conversations.map((c) => c.sellerId))];
    const productIds = [...new Set(conversations.map((c) => c.productId))];

    const buyers = await this.clienteRepository.find({
      where: { id: In(buyerIds) },
      relations: ['profileImages'],
    });

    const sellers = await this.clienteRepository.find({
      where: { id: In(sellerIds) },
      relations: ['profileImages'],
    });

    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['vendedor', 'marketAnimalImages'],
    });

    const buyerMap = new Map(buyers.map((b) => [b.id, b]));
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    return conversations.map((conv) => {
      const buyer = buyerMap.get(conv.buyerId);
      const seller = sellerMap.get(conv.sellerId);
      const product = productMap.get(conv.productId);
      const unreadCount = unreadMap.get(conv.id) || 0;

      return {
        id: conv.id,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.created_at,
        unreadCount: unreadCount,
        hasUnreadMessages: unreadCount > 0,
        buyer: buyer
          ? {
              id: buyer.id,
              nombre: buyer.nombre,
              email: buyer.email,
              currentProfileImage: buyer.profileImages?.[0] || null,
            }
          : null,
        seller: seller
          ? {
              id: seller.id,
              nombre: seller.nombre,
              email: seller.email,
              currentProfileImage: seller.profileImages?.[0] || null,
            }
          : null,
        product: product
          ? {
              id: product.id,
              nombre: product.nombre,
              precio: product.precio,
              moneda: product.moneda,
              vendido: product.vendido,
              descripcion: product.descripcion,
              imagenes: product.marketAnimalImages || [],
              vendedor: product.vendedor
                ? {
                    id: product.vendedor.id,
                    nombre: product.vendedor.nombre,
                    email: product.vendedor.email,
                  }
                : null,
            }
          : null,
      };
    });
  }
}
