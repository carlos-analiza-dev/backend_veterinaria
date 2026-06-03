import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
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
  implements OnModuleInit, OnGatewayConnection
{
  @WebSocketServer()
  public server: Server;

  constructor(
    private readonly chatMarketplaceService: ChatMarketplaceService,
  ) {}

  onModuleInit() {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;

    if (userId) {
      client.join(`user-${userId}`);
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const savedMessage =
      await this.chatMarketplaceService.saveMessage(createMessageDto);

    this.server
      .to(`user-${createMessageDto.receiverId}`)
      .emit('new-message', savedMessage);

    client.emit('message-sent', savedMessage);

    return savedMessage;
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
