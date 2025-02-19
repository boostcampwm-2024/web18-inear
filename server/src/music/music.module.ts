import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MusicProcessingSevice } from './music.processor';
import { CacheModule } from '@nestjs/cache-manager';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { MusicRepository } from './music.repository';
import { M3U8Parser } from './parser/m3u8-parser';
import { S3CacheService } from '../common/s3Cache/s3Cache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      ttl: 3600000,
      max: 1000,
      isGlobal: true,
    }),
  ],
  controllers: [MusicController],
  providers: [
    MusicProcessingSevice,
    MusicService,
    MusicRepository,
    M3U8Parser,
    S3CacheService,
  ],
  exports: [MusicProcessingSevice, MusicRepository],
})
export class MusicModule {}
