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

  async createMessage(createChatDto: CreateChatDto): Promise<Chat> {
    const chatData = {
      ...createChatDto,
      creatorId: new Types.ObjectId(createChatDto.creatorId),
      roomId: new Types.ObjectId(createChatDto.roomId),
      replyId: createChatDto.replyId ? new Types.ObjectId(createChatDto.replyId) : null,
      mentionIds: createChatDto.mentionIds
        ? createChatDto.mentionIds.map((id) => new Types.ObjectId(id))
        : [],
    };
    const chat = new this.chatModel(chatData);
    const savedChat = await chat.save();

    return savedChat.populate({
      path: 'creatorId',
      select: 'name email',
    });
  }

  async getMessagesByRoom(roomId: string): Promise<Chat[]> {
    return this.chatModel
      .find({ roomId: new Types.ObjectId(roomId), deletedAt: null })
      .populate({
        path: 'creatorId',
        select: 'name email',
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getLastMessages(roomId: string, limit: number = 50): Promise<Chat[]> {
    return this.chatModel
      .find({ roomId: new Types.ObjectId(roomId), deletedAt: null })
      .populate({
        path: 'creatorId',
        select: 'name email',
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec()
      .then((messages) => messages.reverse());
  }

  async deleteMessage(messageId: string): Promise<Chat> {
    return this.chatModel
      .findByIdAndUpdate(
        new Types.ObjectId(messageId),
        { deletedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}
