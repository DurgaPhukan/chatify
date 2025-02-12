// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { Chat, ChatDocument } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat, ChatDocument } from './schemas/chat.schemas';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
  ) { }

  // Save a message to the database
  async createMessage(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = new this.chatModel(createChatDto);
    return chat.save();
  }

  // Retrieve all messages in a specific room
  async getMessagesByRoom(roomId: string): Promise<Chat[]> {
    return this.chatModel
      .find({ roomId })
      .sort({ createdAt: 1 }) // Oldest first
      .exec();
  }

  // Soft delete a message
  async deleteMessage(messageId: string): Promise<Chat> {
    return this.chatModel.findByIdAndUpdate(
      messageId,
      { deletedAt: new Date() },
      { new: true },
    );
  }
}
