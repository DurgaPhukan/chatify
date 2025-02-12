// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) { }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const savedMessage = await this.chatService.createMessage(createChatDto);
    this.server.to(createChatDto.roomId).emit('newMessage', savedMessage);
    return savedMessage;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    client.join(roomId);
    this.server.to(roomId).emit('userJoined', { userId: client.id });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    client.leave(roomId);
    this.server.to(roomId).emit('userLeft', { userId: client.id });
  }
}

// export class ChatGateway {
//   @WebSocketServer() server: Server;

//   constructor(private readonly chatService: ChatService) { }

//   // Handle sending a message
//   @SubscribeMessage('sendMessage')
//   async handleSendMessage(
//     @MessageBody() createChatDto: CreateChatDto,
//     @ConnectedSocket() client: Socket,
//   ) {
//     const savedMessage = await this.chatService.createMessage(createChatDto);
//     this.server.to(createChatDto.roomId).emit('newMessage', savedMessage);
//     return savedMessage;
//   }

//   // Handle joining a room
//   @SubscribeMessage('joinRoom')
//   async handleJoinRoom(
//     @MessageBody('roomId') roomId: string,
//     @ConnectedSocket() client: Socket,
//   ) {
//     client.join(roomId);
//     this.server.to(roomId).emit('userJoined', { userId: client.id });
//   }

//   // Handle leaving a room
//   @SubscribeMessage('leaveRoom')
//   async handleLeaveRoom(
//     @MessageBody('roomId') roomId: string,
//     @ConnectedSocket() client: Socket,
//   ) {
//     client.leave(roomId);
//     this.server.to(roomId).emit('userLeft', { userId: client.id });
//   }
// }
