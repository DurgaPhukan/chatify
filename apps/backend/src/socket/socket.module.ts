// src/shared/shared.module.ts
import { Module } from '@nestjs/common';
import { CombinedSocketGateway } from './socket.gateway';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [CombinedSocketGateway],
  exports: [CombinedSocketGateway],
})
export class SharedSocketModule { }