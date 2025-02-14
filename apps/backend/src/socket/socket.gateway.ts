// src/gateway/combined.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { CreateChatDto } from '../chat/dto/create-chat.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class CombinedSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private userSockets = new Map<string, string>();

  constructor(private readonly chatService: ChatService) { }

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, socket.id);
      socket.join(userId);
      console.log(`Client connected: ${socket.id} (User ID: ${userId})`);
    } else {
      console.error('Connection rejected: Missing userId in handshake query');
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = Array.from(this.userSockets.entries()).find(
      ([, id]) => id === socket.id,
    )?.[0];

    if (userId) {
      this.userSockets.delete(userId);
      console.log(`Client disconnected: ${socket.id} (User ID: ${userId})`);
    } else {
      console.log(`Client disconnected: ${socket.id}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (typeof createChatDto === 'string') {
      try {
        createChatDto = JSON.parse(createChatDto);
        console.log(createChatDto);
      } catch (error) {
        throw new Error('Invalid JSON payload');
      }
    }

    if (!createChatDto.message) {
      throw new Error('Message field is required');
    }
    const savedMessage = await this.chatService.createMessage(createChatDto);
    this.server.to(createChatDto.roomId).emit('newMessage', savedMessage);
    return savedMessage;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    if (!roomId) {
      throw new Error('Room ID is required to join a room');
    }
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);

    const lastMessages = await this.chatService.getLastMessages(roomId, 50);
    client.emit('chatHistory', lastMessages);

    this.server.to(roomId).emit('userJoined', { userId: client.id });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    if (!roomId) {
      throw new Error('Room ID is required to leave a room');
    }
    client.leave(roomId);
    console.log(`Client ${client.id} left room ${roomId}`);
    this.server.to(roomId).emit('userLeft', { userId: client.id });
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    } else {
      console.warn(`Notification failed: User ${userId} is not connected`);
    }
  }

  sendNotificationToAll(notification: any) {
    this.server.emit('notification', notification);
  }
}