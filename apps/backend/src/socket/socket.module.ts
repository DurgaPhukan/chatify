import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { WsThrottlerGuard } from 'src/guards/ws-throttler.guard';
import { CombinedSocketGateway } from './socket.gateway';
import { Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerStorageService } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // Time-to-live in milliseconds (1 minute)
          limit: 10, // Maximum number of requests within the TTL
        },
      ],
    }),
    ChatModule,
  ],
  providers: [
    CombinedSocketGateway,
    {
      provide: WsThrottlerGuard,
      useFactory: (throttlerStorage: ThrottlerStorageService, reflector: Reflector) => {
        return new WsThrottlerGuard(
          { throttlers: [{ ttl: 60000, limit: 10 }] }, // Default throttler options
          throttlerStorage,
          reflector,
        );
      },
      inject: ['ThrottlerStorage', Reflector], // Use the string token 'ThrottlerStorage'
    },
    {
      provide: 'ThrottlerStorage', // Provide ThrottlerStorageService with the correct token
      useClass: ThrottlerStorageService,
    },
    Reflector,
  ],
  exports: [CombinedSocketGateway],
})
export class SharedSocketModule { }