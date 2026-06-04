import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMarketplaceService } from './chat_marketplace.service';
import { ChatMarketplaceGateway } from './chat_marketplace.gateway';
import { ChatMarketplaceController } from './chat_marketplace.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { MarketplaceAnimale } from 'src/marketplace_animales/entities/marketplace_animale.entity';
import { MessageImage } from './entities/message-image.entity';
import { ChatImageService } from './chat-image.service';

@Module({
  controllers: [ChatMarketplaceController],
  imports: [
    TypeOrmModule.forFeature(
      [Conversation, Message, MessageImage],
      'chatConnection',
    ),

    TypeOrmModule.forFeature([Cliente, MarketplaceAnimale]),
  ],
  providers: [ChatMarketplaceGateway, ChatMarketplaceService, ChatImageService],
  exports: [ChatMarketplaceService],
})
export class ChatMarketplaceModule {}
