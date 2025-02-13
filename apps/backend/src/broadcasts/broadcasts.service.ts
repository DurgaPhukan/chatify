import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Broadcast, BroadcastDocument } from './schemas/broadcast.schema';
import { CreateBroadcastDto, UpdateBroadcastDto } from './dto/broadcast.dto';

@Injectable()
export class BroadcastsService {
  constructor(
    @InjectModel(Broadcast.name) private readonly broadcastModel: Model<BroadcastDocument>,
  ) { }

  /**
   * Creates a new broadcast.
   * @param createBroadcastDto - The DTO for creating a broadcast.
   * @returns The created broadcast document.
   */
  async create(createBroadcastDto: CreateBroadcastDto): Promise<Broadcast> {
    const { startTime, endTime } = createBroadcastDto;

    if (endTime && startTime && endTime <= startTime) {
      throw new BadRequestException('End time must be greater than start time');
    }

    try {
      const newBroadcast = new this.broadcastModel(createBroadcastDto);
      return await newBroadcast.save();
    } catch (error) {
      throw new BadRequestException('Failed to create broadcast: ' + error.message);
    }
  }

  /**
   * Finds all broadcasts.
   * @returns An array of broadcast documents.
   */
  async findAll(): Promise<Broadcast[]> {
    try {
      const data = await this.broadcastModel.find().exec();
      console.log("\n\n\n===>\n", JSON.stringify(data))
      return data
    } catch (error) {
      throw new BadRequestException('Failed to retrieve broadcasts: ' + error.message);
    }
  }

  /**
   * Finds a broadcast by its ID.
   * @param id - The ID of the broadcast to find.
   * @returns The broadcast document.
   */
  async findById(id: string): Promise<Broadcast> {
    try {
      const broadcast = await this.broadcastModel.findById(id).exec();
      if (!broadcast) {
        throw new NotFoundException(`Broadcast with ID ${id} not found`);
      }
      return broadcast;
    } catch (error) {
      throw new NotFoundException(`Error retrieving broadcast: ${error.message}`);
    }
  }

  /**
   * Updates a broadcast by ID.
   * @param id - The ID of the broadcast to update.
   * @param updateBroadcastDto - The DTO for updating a broadcast.
   * @returns The updated broadcast document.
   */
  async update(id: string, updateBroadcastDto: UpdateBroadcastDto): Promise<Broadcast> {
    const { startTime, endTime } = updateBroadcastDto;

    if (endTime && startTime && endTime <= startTime) {
      throw new BadRequestException('End time must be greater than start time');
    }

    try {
      const updatedBroadcast = await this.broadcastModel
        .findByIdAndUpdate(id, updateBroadcastDto, { new: true, runValidators: true })
        .exec();

      if (!updatedBroadcast) {
        throw new NotFoundException(`Broadcast with ID ${id} not found`);
      }

      return updatedBroadcast;
    } catch (error) {
      throw new BadRequestException(`Failed to update broadcast: ${error.message}`);
    }
  }

  /**
   * Deletes a broadcast by ID.
   * @param id - The ID of the broadcast to delete.
   * @returns The deleted broadcast document.
   */
  async delete(id: string): Promise<Broadcast> {
    try {
      const deletedBroadcast = await this.broadcastModel.findByIdAndDelete(id).exec();
      if (!deletedBroadcast) {
        throw new NotFoundException(`Broadcast with ID ${id} not found`);
      }
      return deletedBroadcast;
    } catch (error) {
      throw new BadRequestException(`Failed to delete broadcast: ${error.message}`);
    }
  }
}
