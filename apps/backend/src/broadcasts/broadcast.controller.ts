import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { CreateBroadcastDto, UpdateBroadcastDto } from './dto/broadcast.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) { }

  /**
   * Create a new broadcast.
   * @param data - Broadcast data from the request body.
   * @returns The created broadcast.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateBroadcastDto) {
    return this.broadcastsService.create(data);
  }

  /**
   * Retrieve all broadcasts.
   * @returns An array of broadcasts.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.broadcastsService.findAll();
  }

  /**
   * Retrieve a broadcast by ID.
   * @param id - The ID of the broadcast to retrieve.
   * @returns The broadcast with the specified ID.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.broadcastsService.findById(id);
  }

  /**
   * Update a broadcast by ID.
   * @param id - The ID of the broadcast to update.
   * @param updateData - Updated broadcast data from the request body.
   * @returns The updated broadcast.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateBroadcastDto) {
    return this.broadcastsService.update(id, updateData);
  }

  /**
   * Delete a broadcast by ID.
   * @param id - The ID of the broadcast to delete.
   * @returns The deleted broadcast.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.broadcastsService.delete(id);
  }
}
