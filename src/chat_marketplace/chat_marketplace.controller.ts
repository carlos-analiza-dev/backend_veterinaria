import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatMarketplaceService } from './chat_marketplace.service';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('chat-marketplace')
export class ChatMarketplaceController {
  constructor(private readonly chatService: ChatMarketplaceService) {}

  @Post('conversation')
  @AuthCliente()
  async getOrCreateConversation(
    @Body() data: { sellerId: string; productId: string },
    @GetCliente() cliente: Cliente,
  ) {
    return this.chatService.getOrCreateConversation(
      cliente.id,
      data.sellerId,
      data.productId,
    );
  }

  @Get('conversations')
  @AuthCliente()
  async getUserConversations(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.chatService.getUserConversations(cliente.id, paginationDto);
  }

  @Get('conversation/:id/messages')
  async getConversationMessages(@Param('id') id: string) {
    return this.chatService.getConversationMessages(id);
  }
}
