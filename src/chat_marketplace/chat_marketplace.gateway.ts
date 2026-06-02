import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatMarketplaceService } from './chat_marketplace.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './dtos/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL_CLIENT || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatMarketplaceGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  private userSockets: Map<string, string> = new Map();

  constructor(
    private readonly chatMarketplaceService: ChatMarketplaceService,
  ) {}

  onModuleInit() {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.userSockets.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const savedMessage =
        await this.chatMarketplaceService.saveMessage(createMessageDto);

      const sellerSocketId = this.userSockets.get(createMessageDto.receiverId);
      if (sellerSocketId) {
        this.server.to(sellerSocketId).emit('new-message', savedMessage);
      }

      client.emit('message-sent', savedMessage);

      return savedMessage;
    } catch (error) {
      client.emit('message-error');
    }
  }

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation-${data.conversationId}`);
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    await this.chatMarketplaceService.markMessagesAsRead(
      data.conversationId,
      data.userId,
    );
    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('messages-read', data);
  }
}
