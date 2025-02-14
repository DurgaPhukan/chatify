import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly NotificationService: NotificationsService) { }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id)
      console.log('Notification Service Connected')
    })

    this.server.on('disconnect', (socket: Socket) => {
      console.log(`Notification Client disconnected: ${socket.id}`);
    });
  }


  sendNotification(message: string) {
    this.server.emit('notification', message);
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Message received';
  }
}