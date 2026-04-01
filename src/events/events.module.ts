// src/calendar/events/events.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from 'src/categories/categories.module'; // якщо використовуєш CategoriesService
import { Category } from 'src/categories/category.entity';
import { UsersModule } from 'src/users/users.module'; // якщо використовуєш UsersService

import { Recurrence, Reminder, Tag } from 'src/calendar/entities';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Tag,
      Category,
      Recurrence, // ← обов'язково додай
      Reminder, // ← обов'язково додай
    ]),
    CategoriesModule, // якщо інжектуєш CategoriesService
    UsersModule, // якщо інжектуєш UsersService
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
