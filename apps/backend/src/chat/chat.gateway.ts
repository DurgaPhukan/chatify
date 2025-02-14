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

export class ChatGateway {
  @WebSocketServer() server: Server;
  constructor(private readonly chatService: ChatService) { }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id)
      console.log('Connected')
    })

    this.server.on('disconnect', (socket: Socket) => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  }


  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (typeof createChatDto === 'string') {
      try {
        createChatDto = JSON.parse(createChatDto); // Parse the payload into an object
        console.log(createChatDto)
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

  // Handle joining a room
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    // Ensure roomId is provided
    if (!roomId) {
      throw new Error('Room ID is required to join a room');
    }

    // Join the specified room
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);

    // Fetch the last 50 messages for the room
    const lastMessages = await this.chatService.getLastMessages(roomId, 50);

    // Emit chat history to the joining client
    client.emit('chatHistory', lastMessages);

    // Notify other users in the room
    this.server.to(roomId).emit('userJoined', { userId: client.id });
  }

  // Handle leaving a room
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    if (!roomId) {
      throw new Error('Room ID is required to leave a room');
    }

    // Leave the specified room
    client.leave(roomId);
    console.log(`Client ${client.id} left room ${roomId}`);

    // Notify other users in the room
    this.server.to(roomId).emit('userLeft', { userId: client.id });
  }
}