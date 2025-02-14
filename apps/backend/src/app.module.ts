import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BroadcastsModule } from './broadcasts/broadcasts.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SharedSocketModule } from './socket/socket.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    BroadcastsModule,
    NotificationsModule,
    ChatModule,
    SharedSocketModule
  ],
  controllers: [],
  providers: [],
  // exports: [CombinedSocketGateway],
})
export class AppModule { }