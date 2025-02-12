import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(message: string) {
    this.server.emit('notification', message);
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Message received';
  }
}


// @WebSocketGateway()
// export class NotificationsGateway {
//   @WebSocketServer()
//   server: Server;

//   sendNotification(message: string) {
//     this.server.emit('notification', message);
//   }
// }