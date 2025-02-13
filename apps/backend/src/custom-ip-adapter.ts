import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: 'http://localhost:3000',
        credentials: true,
      },
    });
    server.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
    return server;
  }
}
