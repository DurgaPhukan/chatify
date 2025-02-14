// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat, ChatDocument } from './schemas/chat.schemas';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
  ) { }

  // Save a message to the database
  async createMessage(createChatDto: CreateChatDto): Promise<Chat> {
    console.log('============>>>', createChatDto);
    const chatData = {
      ...createChatDto,
      creatorId: new Types.ObjectId(createChatDto.creatorId),
      roomId: new Types.ObjectId(createChatDto.roomId),
      replyId: createChatDto.replyId ? new Types.ObjectId(createChatDto.replyId) : null,
      mentionIds: createChatDto.mentionIds
        ? createChatDto.mentionIds.map((id) => new Types.ObjectId(id)) // Map mentionIds to ObjectId
        : [],
    };
    const chat = new this.chatModel(chatData);
    const savedChat = await chat.save();

    // Populate creatorId with name and email
    return savedChat.populate({
      path: 'creatorId',
      select: 'name email',
    });
  }

  /**
   * Retrieve all messages in a specific room
   * @param roomId - The ID of the chat room
   */
  async getMessagesByRoom(roomId: string): Promise<Chat[]> {
    return this.chatModel
      .find({ roomId: new Types.ObjectId(roomId), deletedAt: null }) // Exclude soft-deleted messages
      .populate({
        path: 'creatorId',
        select: 'name email',
      })
      .sort({ createdAt: 1 }) // Oldest first
      .exec();
  }

  /**
   * Retrieve the last N messages in a specific room
   * @param roomId - The ID of the chat room
   * @param limit - The number of messages to retrieve
   */
  async getLastMessages(roomId: string, limit: number = 50): Promise<Chat[]> {
    return this.chatModel
      .find({ roomId: new Types.ObjectId(roomId), deletedAt: null }) // Exclude soft-deleted messages
      .populate({
        path: 'creatorId',
        select: 'name email',
      })
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .exec()
      .then((messages) => messages.reverse()); // Reverse to return the oldest first
  }

  /**
   * Soft delete a message by setting the `deletedAt` timestamp
   * @param messageId - The ID of the message to delete
   */
  async deleteMessage(messageId: string): Promise<Chat> {
    return this.chatModel
      .findByIdAndUpdate(
        new Types.ObjectId(messageId),
        { deletedAt: new Date() }, // Set `deletedAt` timestamp
        { new: true }, // Return the updated document
      )
      .exec();
  }
}
