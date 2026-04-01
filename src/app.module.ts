import { BullModule } from '@nestjs/bullmq';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { RedisClientOptions } from 'redis';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { CategoriesModule } from './categories/categories.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    NestCacheModule.register<RedisClientOptions>({
      // store: redisStore,
      url: process.env.REDIS_HOST,
      ttl: 300, // cache for 5 minutes
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: parseInt(configService.get<string>('REDIS_PORT') || '6379', 10),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    EventsModule,
    NotificationsModule,
    RecommendationsModule,
    ActivityLogModule,
    CalendarModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
