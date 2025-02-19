import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoomRepository } from '@/room/room.repository';
import { REDIS_CLIENT } from '@/common/redis/redis.module';
import { RedisClientType } from 'redis';
import * as crypto from 'node:crypto';
import { RandomNameUtil } from '@/common/randomname/random-name.util';
import { Request } from 'express';
import { Album } from '@/album/album.entity';
import { Song } from '@/song/song.entity';
import { AlbumResponseDto } from '@/album/dto/album-response.dto';
import { SongResponseDto } from '@/song/dto/song-response.dto';
import { plainToInstance } from 'class-transformer';
import { SongRepository } from '@/song/song.repository';
import { ORDER } from '@/common/constants/repository.constant';
import { AlbumRepository } from '@/album/album.repository';
import { RoomService } from '@/room/room.service';

@ApiTags('기본')
@Controller('room')
export class RoomController {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly roomRepository: RoomRepository,
    private readonly albumRepository: AlbumRepository,
    private readonly songRepository: SongRepository,
    private readonly roomService: RoomService,
  ) {}

  @ApiOperation({ summary: '방 정보 확인' })
  @ApiParam({ name: 'roomId', required: true })
  @ApiResponse({ status: 200, description: 'Room info retrieved successfully' })
  @Get('/:roomId')
  async getRoomInfo(@Param('roomId') roomId: string): Promise<any> {
    const roomKey = `rooms:${roomId}`;
    const roomInfo = await this.redisClient.hGetAll(roomKey);
    const albumInfo = await this.albumRepository.findById(roomId);
    const albumResponse = await this.getAlbumResponseDto(albumInfo);
    const songList = await this.songRepository.getAlbumTracksSorted(
      roomId,
      ORDER.ASC,
    );
    const songResponseList = await Promise.all(
      songList.map(async (song) => await this.getSongResponseDto(song)),
    );

    const totalDuration = songResponseList.reduce((acc, song) => {
      return acc + parseInt(song.duration);
    }, 0);

    const trackOrder = await this.roomService.getTrackOrder(roomId);

    return {
      success: true,
      ...roomInfo,
      albumResponse,
      songResponseList,
      totalDuration,
      trackOrder,
    };
  }

  async getAlbumResponseDto(album: Album): Promise<AlbumResponseDto> {
    return plainToInstance(AlbumResponseDto, album, {
      excludeExtraneousValues: true,
    });
  }

  async getSongResponseDto(song: Song): Promise<SongResponseDto> {
    return plainToInstance(SongResponseDto, song, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: '방 참여' })
  @ApiResponse({ status: 201, description: 'Joined room successfully' })
  @Post('/join')
  async joinRoom(
    @Req() req: Request,
    @Body() joinRoomDto: { userId: string; roomId: string },
  ): Promise<object> {
    const identifier = crypto
      .createHmac('sha256', req.ip + process.env.SECRET_KEY)
      .digest('hex')
      .slice(0, 4);
    const randomName = RandomNameUtil.generate();
    await this.roomRepository.joinRoom(joinRoomDto.userId, joinRoomDto.roomId);
    return { success: true, message: 'Joined room', identifier, randomName };
  }
}
