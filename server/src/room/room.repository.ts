import { REDIS_CLIENT } from '@/common/redis/redis.module';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { Room } from './room.entity';

export interface RoomInfo {
  currentUsers: number;
  maxCapacity: number;
  isActive: boolean;
  currentSong: string;
  songs: string[];
}

@Injectable()
export class RoomRepository {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  private roomKey(roomId: string): string {
    return `rooms:${roomId}`;
  }

  private roomUsersKey(roomId: string): string {
    return `rooms:${roomId}:users`;
  }

  private roomQueueKey(roomId: string): string {
    return `rooms:${roomId}:queue`;
  }

  async createRoom(room: Room): Promise<void> {
    const roomKey = this.roomKey(room.id);

    await this.redisClient
      .multi()
      .hSet(roomKey, 'id', room.id)
      .hSet(roomKey, 'createdAt', room.createdAt.toISOString())
      .hSet(roomKey, 'isActive', 'true')
      .hSet(roomKey, 'currentUsers', '0')
      .hSet(roomKey, 'maxCapacity', '10')
      .exec();
    return;
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    const roomKey = this.roomKey(roomId);
    const roomUsersKey = this.roomUsersKey(roomId);

    const exists = await this.redisClient.exists(roomKey);
    if (!exists) {
      throw new Error('Room not found');
    }

    const isMember = await this.redisClient.sIsMember(roomUsersKey, userId);
    if (!isMember) {
      throw new Error('User is not in the room');
    }

    const multi = this.redisClient.multi();
    multi.sRem(roomUsersKey, userId);
    multi.hIncrBy(roomKey, 'currentUsers', -1);

    await multi.exec();
  }

  async findRoom(roomId: string): Promise<Room | any> {
    const roomKey = this.roomKey(roomId);

    const exists = await this.redisClient.exists(roomKey);
    if (!exists) {
      return null;
    }

    const [id, name, createdAt] = await Promise.all([
      this.redisClient.hGet(roomKey, 'id'),
      this.redisClient.hGet(roomKey, 'name'),
      this.redisClient.hGet(roomKey, 'createdAt'),
    ]);

    return new Room({
      id,
      createdAt: new Date(createdAt),
    });
  }

  async validateRoom(roomKey: string): Promise<void> {
    const exists = await this.redisClient.exists(roomKey);
    if (!exists) throw new Error('Room not found');

    const [isActive, currentUsers, maxCapacity] = await Promise.all([
      this.redisClient.hGet(roomKey, 'isActive'),
      this.redisClient.hGet(roomKey, 'currentUsers'),
      this.redisClient.hGet(roomKey, 'maxCapacity'),
    ]);

    if (!isActive || isActive !== 'true') {
      throw new Error('Room is inactive');
    }
    if (Number(currentUsers) >= Number(maxCapacity)) {
      throw new Error('Room is full');
    }
  }

  async joinRoom(userId: string, roomId: string): Promise<void> {
    const roomKey = this.roomKey(roomId);
    await this.validateRoom(roomKey);

    const multi = this.redisClient.multi();
    multi.sAdd(this.roomUsersKey(roomId), userId);
    multi.hIncrBy(roomKey, 'currentUsers', 1);

    await multi.exec();
  }

  async getCurrentUsers(roomId: string): Promise<number> {
    const roomKey = this.roomKey(roomId);
    const currentUsers = await this.redisClient.hGet(roomKey, 'currentUsers');
    return parseInt(currentUsers || '0', 10);
  }
}
