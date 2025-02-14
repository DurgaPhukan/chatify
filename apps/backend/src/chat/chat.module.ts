// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedSocketModule } from 'src/socket/socket.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat, ChatSchema } from './schemas/chat.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  providers: [ChatService],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule { }
