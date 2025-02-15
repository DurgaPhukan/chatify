import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import { THROTTLER_OPTIONS } from '@nestjs/throttler/dist/throttler.constants';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject(THROTTLER_OPTIONS)
    protected readonly throttlerOptions: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorageService,
    protected readonly reflector: Reflector,
  ) {
    super(throttlerOptions, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const eventName = context.getHandler().name;

      const clientId = client.handshake.query.userId || client.id; // Use `client.id` as fallback.

      // Define per-event limits and TTLs
      const eventLimits = {
        handleSendMessage: { limit: 7, ttl: 10 }, // 7 messages per 10 seconds
        handleJoinRoom: { limit: 5, ttl: 30 },
        handleLeaveRoom: { limit: 5, ttl: 30 },
        default: { limit: 30, ttl: 60 },
      };

      const { limit, ttl } = eventLimits[eventName] || eventLimits.default;

      // Generate a unique throttling key
      const key = this.generateKey(context, clientId as string, eventName);

      // Fetch the current usage from storage
      const currentRecord = await this.storageService.storage.get(key);

      const now = Date.now();
      let totalHits = currentRecord?.totalHits || new Map<string, number>();
      let expiresAt = currentRecord?.expiresAt || now + ttl * 1000;

      // Check if the current time window has expired
      if (now >= expiresAt) {
        // Reset the hit count and set a new expiration time
        totalHits = new Map<string, number>();
        expiresAt = now + ttl * 1000;
      }

      // Check if the key already exists for the "default" throttler
      const throttlerName = 'default'; // Adjust if you use a custom throttler name
      const currentHits = totalHits.get(throttlerName) || 0;

      // Increment the hit count and update the map
      totalHits.set(throttlerName, currentHits + 1);

      // Update the record in storage
      await this.storageService.storage.set(key, {
        totalHits,
        expiresAt,
        isBlocked: false, // Ensure this property is included
        blockExpiresAt: 0, // Ensure this property is included
      });

      // Calculate time to expire
      const timeToExpire = Math.ceil((expiresAt - now) / 1000);

      console.log('After increment:', {
        totalHits: Array.from(totalHits.entries()), // Log the map as an array for clarity
        expiresAt,
        timeToExpire,
        ttl,
      });

      // Block if the client exceeded the limit
      if (currentHits + 1 > limit) {
        client.emit('throttle_error', {
          message: `Too many requests for event "${eventName}". Please wait ${timeToExpire} seconds.`,
          event: eventName,
          totalHits: currentHits + 1,
          timeToExpire,
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Throttling error:', error);
      return false;
    }
  }

  protected generateKey(context: ExecutionContext, clientId: string, eventName: string): string {
    return `${clientId}:${eventName}`;
  }
}