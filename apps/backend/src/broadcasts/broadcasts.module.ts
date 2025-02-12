import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BroadcastsService } from './broadcasts.service';
import { Broadcast, BroadcastSchema } from './schemas/broadcast.schema';
import { BroadcastsController } from './broadcast.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Broadcast.name, schema: BroadcastSchema }]), AuthModule],
  providers: [BroadcastsService],
  controllers: [BroadcastsController],
})
export class BroadcastsModule { }